import type { Context } from 'hono';
import { createOrderSchema } from '@scanorder/shared';
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

    // PowerSync sends: { transactions: [{ ops: [{ op: 'PUT', table, id, data }] }] }
    const { transactions } = body;

    if (!Array.isArray(transactions)) {
      return c.json({ error: 'Invalid payload: transactions array required' }, 400);
    }

    // Get authenticated user context (set by auth middleware)
    const user = c.get('user') as AuthUser | undefined;
    const tenantId = user?.tenantId;
    const userId = user?.userId;

    // Get DB binding (Hyperdrive). If not configured, fall back to acknowledgement-only mode.
    const db = c.env.DB;

    const results: UploadResult[] = [];

    for (const tx of transactions) {
      for (const op of tx.ops ?? []) {
        const { table, id, data, op: opType } = op;

        // Only handle PUT (insert/upsert) operations for now
        if (opType && opType !== 'PUT') {
          results.push({ table, id, status: 'ok' });
          continue;
        }

        try {
          switch (table) {
            case 'orders': {
              const result = await handleOrderUpload(db, {
                ...data,
                id,
                tenant_id: tenantId,
                user_id: userId ?? data.user_id,
              });
              results.push({ table, id, ...result });
              break;
            }

            case 'order_lines': {
              const result = await handleOrderLineUpload(db, {
                ...data,
                id,
              });
              results.push({ table, id, ...result });
              break;
            }

            default:
              results.push({
                table,
                id,
                status: 'error',
                error: `Unknown table: ${table}`,
              });
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          console.error(`Error processing ${table}/${id}:`, message);
          results.push({ table, id, status: 'error', error: message });
        }
      }
    }

    return c.json({ results });
  } catch (err) {
    console.error('Sync upload error:', err);
    return c.json({ error: 'Internal server error' }, 500);
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
  db: HyperdriveBinding | undefined,
  data: Record<string, unknown>
): Promise<{ status: 'ok' | 'error'; error?: string; order_number?: string }> {
  // Validate order data
  const parsed = createOrderSchema.safeParse(data);
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.message };
  }

  const order = parsed.data;

  // If no DB connection (Hyperdrive not configured), acknowledge receipt
  // This allows the endpoint to work in development without a live DB
  if (!db) {
    console.warn('No DB binding — acknowledging order without persistence:', order.id);
    return { status: 'ok' };
  }

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
        notes, payment_method, payment_terms, device_id,
        created_offline, synced_at, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        'pending', $7, $8, $9, $10, $11,
        $12, $13, $14, $15,
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
      data.device_id as string ?? null
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
 * - Inserts the line item into order_lines
 * - Decrements stock on the product or variant
 */
async function handleOrderLineUpload(
  db: HyperdriveBinding | undefined,
  data: Record<string, unknown>
): Promise<{ status: 'ok' | 'error'; error?: string }> {
  if (!db) {
    return { status: 'ok' };
  }

  const id = data.id as string;
  const orderId = data.order_id as string;
  const productId = data.product_id as string;
  const variantId = data.variant_id as string | null;
  const productName = data.product_name as string;
  const productSku = data.product_sku as string;
  const quantity = data.quantity as number;
  const unitPrice = data.unit_price as number;
  const discountPct = (data.discount_pct as number) ?? 0;
  const taxRate = (data.tax_rate as number) ?? 2100;
  const lineTotal = data.line_total as number;
  const notes = data.notes as string | null ?? null;

  if (!orderId || !productId || !productName || !productSku || !quantity || !unitPrice) {
    return { status: 'error', error: 'Missing required order line fields' };
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
      discountPct, taxRate, lineTotal, notes
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
