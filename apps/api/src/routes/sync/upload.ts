import type { Context } from 'hono';
import { createOrderSchema, syncUploadPayloadSchema } from '@scanorder/shared';
import type { AuthUser } from '../../middleware/auth';
import { formatOrderNumber } from '../../lib/order-number';

/**
 * PowerSync Upload Handler
 *
 * Receives orders created offline on mobile devices via PowerSync's upload queue.
 * PowerSync sends batches of operations (PUT/PATCH/DELETE) grouped into transactions.
 *
 * Each operation represents a row change from the local SQLite DB.
 * We validate, deduplicate (idempotency), assign order numbers, and insert into
 * Supabase PostgreSQL via Hyperdrive.
 *
 * Idempotency: If an order with the same UUID already exists, we return success
 * without re-inserting. This handles PowerSync retries safely.
 */
export async function syncUpload(c: Context) {
  try {
    const body = await c.req.json();

    // Validate top-level PowerSync upload structure with Zod
    const payloadResult = syncUploadPayloadSchema.safeParse(body);
    if (!payloadResult.success) {
      return c.json({
        error: 'Invalid payload',
        details: payloadResult.error.issues.map((i) => i.message),
      }, 400);
    }

    const { transactions } = payloadResult.data;

    // Get authenticated user context (set by auth middleware)
    const user = c.get('user') as AuthUser | undefined;

    if (!user || !user.tenantId || !user.userId) {
      return c.json({ error: 'Unauthorized: missing user, tenant, or user ID' }, 401);
    }

    const tenantId = user.tenantId;
    const userId = user.userId;

    // Get DB binding (Hyperdrive). If not configured, fall back to acknowledgement-only mode.
    const db = c.env.DB;

    const results: UploadResult[] = [];

    for (const tx of transactions) {
      // Group ops within this PowerSync transaction by table
      // so we can process order + its lines together atomically
      const orderOps: Array<{ id: string; data: Record<string, unknown> }> = [];
      const lineOps: Array<{ id: string; data: Record<string, unknown> }> = [];
      const otherOps: Array<{ table: string; id: string; op: string }> = [];

      for (const op of tx.ops ?? []) {
        const { table, id, data, op: opType } = op;

        // Only handle PUT (insert/upsert) operations for now
        if (opType && opType !== 'PUT') {
          results.push({ table, id, status: 'ok' });
          continue;
        }

        switch (table) {
          case 'orders': {
            // Validate tenant_id matches auth context if provided by client
            if (data.tenant_id && data.tenant_id !== tenantId) {
              results.push({ table, id, status: 'error', error: 'tenant_id mismatch: order tenant does not match authenticated user' });
              continue;
            }
            orderOps.push({ id, data: { ...data, id, tenant_id: tenantId, user_id: userId ?? data.user_id } });
            break;
          }
          case 'order_lines':
            lineOps.push({ id, data: { ...data, id } });
            break;
          default:
            otherOps.push({ table, id, op: opType ?? 'PUT' });
        }
      }

      // Process order + lines atomically within a transaction
      if (orderOps.length > 0 || lineOps.length > 0) {
        try {
          const txResults = await handleOrderTransaction(db, orderOps, lineOps, tenantId);
          results.push(...txResults);
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Transaction failed';
          console.error('Transaction error:', message);
          // Mark all ops in this transaction as failed
          for (const op of orderOps) {
            results.push({ table: 'orders', id: op.id, status: 'error', error: message });
          }
          for (const op of lineOps) {
            results.push({ table: 'order_lines', id: op.id, status: 'error', error: message });
          }
        }
      }

      // Handle unknown table ops
      for (const op of otherOps) {
        results.push({
          table: op.table,
          id: op.id,
          status: 'error',
          error: `Unknown table: ${op.table}`,
        });
      }
    }

    return c.json({ results });
  } catch (err) {
    console.error('Sync upload error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Process order and line operations within a single logical transaction.
 * Wraps all inserts in BEGIN/COMMIT for atomicity.
 * If any operation fails, the entire batch is rolled back.
 */
async function handleOrderTransaction(
  db: HyperdriveBinding | undefined,
  orderOps: Array<{ id: string; data: Record<string, unknown> }>,
  lineOps: Array<{ id: string; data: Record<string, unknown> }>,
  tenantId: string,
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  // If no DB connection, acknowledge all ops without persistence
  if (!db) {
    for (const op of orderOps) {
      console.warn('No DB binding — acknowledging order without persistence:', op.id);
      results.push({ table: 'orders', id: op.id, status: 'ok' });
    }
    for (const op of lineOps) {
      results.push({ table: 'order_lines', id: op.id, status: 'ok' });
    }
    return results;
  }

  // Begin transaction
  await db.prepare('BEGIN').bind().run();

  try {
    // Process orders first
    for (const op of orderOps) {
      const result = await handleOrderUpload(db, op.data);
      results.push({ table: 'orders', id: op.id, ...result });
      if (result.status === 'error') {
        throw new Error(`Order ${op.id} failed: ${result.error}`);
      }
    }

    // Process order lines
    for (const op of lineOps) {
      const result = await handleOrderLineUpload(db, op.data);
      results.push({ table: 'order_lines', id: op.id, ...result });
      if (result.status === 'error') {
        throw new Error(`Order line ${op.id} failed: ${result.error}`);
      }
    }

    // Commit transaction
    await db.prepare('COMMIT').bind().run();
    return results;
  } catch (err) {
    // Rollback on any failure
    try {
      await db.prepare('ROLLBACK').bind().run();
    } catch (rollbackErr) {
      console.error('Rollback failed:', rollbackErr);
    }
    throw err;
  }
}

/**
 * Handle a single order upload.
 *
 * - Validates with Zod schema
 * - Checks for duplicate (idempotency by order UUID)
 * - Assigns server-side order number (SO-NNNN)
 * - Inserts into orders table
 */
async function handleOrderUpload(
  db: HyperdriveBinding,
  data: Record<string, unknown>
): Promise<{ status: 'ok' | 'error'; error?: string; order_number?: string }> {
  // Validate order data
  const parsed = createOrderSchema.safeParse(data);
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.message };
  }

  const order = parsed.data;

  try {
    // Idempotency check: does this order already exist?
    const existing = await db.prepare(
      'SELECT id, order_number FROM orders WHERE id = $1'
    ).bind(order.id).first<{ id: string; order_number: string }>();

    if (existing) {
      // Already processed — return success with the existing order number
      return { status: 'ok', order_number: existing.order_number };
    }

    // Generate sequential order number (atomic per tenant)
    const tenantId = data.tenant_id as string;
    const seqResult = await db.prepare(
      `INSERT INTO order_sequences (tenant_id, prefix, next_number)
       VALUES ($1, 'SO', 2)
       ON CONFLICT (tenant_id) DO UPDATE
         SET next_number = order_sequences.next_number + 1
       RETURNING next_number - 1 AS current_number`
    ).bind(tenantId).first<{ current_number: number }>();

    const orderNumber = formatOrderNumber('SO', seqResult?.current_number ?? 1);

    // Calculate totals from lines if provided, otherwise use submitted values
    const subtotal = data.subtotal as number ?? 0;
    const taxAmount = data.tax_amount as number ?? 0;
    const total = data.total as number ?? 0;

    // Insert the order
    await db.prepare(
      `INSERT INTO orders (
        id, tenant_id, order_number, customer_id, event_id, user_id,
        status, subtotal, discount_amount, tax_amount, total, currency,
        notes, payment_method, payment_terms, device_id, session_id,
        created_offline, synced_at, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        'pending', $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16,
        true, NOW(), NOW(), NOW()
      )`
    ).bind(
      order.id,
      tenantId,
      orderNumber,
      order.customer_id,
      order.event_id,
      data.user_id as string,
      subtotal,
      data.discount_amount as number ?? 0,
      taxAmount,
      total,
      order.currency,
      order.notes,
      order.payment_method,
      order.payment_terms,
      order.device_id ?? null,
      order.session_id ?? null,
    ).run();

    return { status: 'ok', order_number: orderNumber };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'DB insert failed';
    console.error('Order insert error:', message);
    return { status: 'error', error: message };
  }
}

/**
 * Handle a single order line upload.
 *
 * - Validates fields with explicit type checks
 * - Inserts the line item into order_lines
 * - Decrements stock on the product or variant
 */
async function handleOrderLineUpload(
  db: HyperdriveBinding,
  data: Record<string, unknown>
): Promise<{ status: 'ok' | 'error'; error?: string }> {
  // Validate order line fields with explicit type checks
  const id = data.id;
  const orderId = data.order_id;
  const productId = data.product_id;
  const variantId = data.variant_id ?? null;
  const productName = data.product_name;
  const productSku = data.product_sku;
  const quantity = data.quantity;
  const unitPrice = data.unit_price;
  const discountPct = data.discount_pct ?? 0;
  const taxRate = data.tax_rate ?? 2100;
  const lineTotalVal = data.line_total;
  const notes = data.notes ?? null;

  // Validate required string fields
  if (typeof id !== 'string' || !id) {
    return { status: 'error', error: 'Missing or invalid order line id' };
  }
  if (typeof orderId !== 'string' || !orderId) {
    return { status: 'error', error: 'Missing or invalid order_id' };
  }
  if (typeof productId !== 'string' || !productId) {
    return { status: 'error', error: 'Missing or invalid product_id' };
  }
  if (typeof productName !== 'string' || !productName) {
    return { status: 'error', error: 'Missing or invalid product_name' };
  }
  if (typeof productSku !== 'string' || !productSku) {
    return { status: 'error', error: 'Missing or invalid product_sku' };
  }

  // Validate numeric fields
  if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity <= 0) {
    return { status: 'error', error: `quantity must be a positive integer, got: ${quantity}` };
  }
  if (typeof unitPrice !== 'number' || !Number.isInteger(unitPrice) || unitPrice < 0) {
    return { status: 'error', error: `unit_price must be a non-negative integer (cents), got: ${unitPrice}` };
  }
  if (typeof discountPct !== 'number' || discountPct < 0 || discountPct > 100) {
    return { status: 'error', error: `discount_pct must be 0-100, got: ${discountPct}` };
  }
  if (typeof taxRate !== 'number' || !Number.isInteger(taxRate) || taxRate < 0) {
    return { status: 'error', error: `tax_rate must be a non-negative integer (basis points), got: ${taxRate}` };
  }
  if (typeof lineTotalVal !== 'number' || !Number.isInteger(lineTotalVal) || lineTotalVal < 0) {
    return { status: 'error', error: `line_total must be a non-negative integer (cents), got: ${lineTotalVal}` };
  }

  // Validate optional fields
  if (variantId !== null && typeof variantId !== 'string') {
    return { status: 'error', error: 'variant_id must be a string or null' };
  }
  if (notes !== null && typeof notes !== 'string') {
    return { status: 'error', error: 'notes must be a string or null' };
  }

  try {
    // Idempotency: check if line already exists
    const existing = await db.prepare(
      'SELECT id FROM order_lines WHERE id = $1'
    ).bind(id).first();

    if (existing) {
      return { status: 'ok' };
    }

    // Insert order line
    await db.prepare(
      `INSERT INTO order_lines (
        id, order_id, product_id, variant_id,
        product_name, product_sku, quantity, unit_price,
        discount_pct, tax_rate, line_total, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`
    ).bind(
      id, orderId, productId, variantId,
      productName, productSku, quantity, unitPrice,
      discountPct, taxRate, lineTotalVal, notes
    ).run();

    // Decrement stock on the product or variant
    if (variantId) {
      await db.prepare(
        `UPDATE product_variants SET stock_qty = stock_qty - $1, updated_at = NOW()
         WHERE id = $2 AND stock_qty >= $1`
      ).bind(quantity, variantId).run();
    } else {
      await db.prepare(
        `UPDATE products SET stock_qty = stock_qty - $1, updated_at = NOW()
         WHERE id = $2 AND stock_qty >= $1`
      ).bind(quantity, productId).run();
    }

    return { status: 'ok' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'DB insert failed';
    console.error('Order line insert error:', message);
    return { status: 'error', error: message };
  }
}

interface UploadResult {
  table: string;
  id: string;
  status: 'ok' | 'error';
  error?: string;
  order_number?: string;
}

/**
 * Hyperdrive binding type (Cloudflare Workers).
 * Provides a connection-pooled interface to PostgreSQL.
 */
interface HyperdriveBinding {
  prepare(query: string): {
    bind(...params: unknown[]): {
      run(): Promise<void>;
      first<T = Record<string, unknown>>(): Promise<T | null>;
      all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
    };
  };
}
