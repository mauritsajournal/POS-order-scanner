import type { Context } from 'hono';
import { createOrderSchema } from '@scanorder/shared';

/**
 * PowerSync Upload Handler
 *
 * Receives orders created offline on devices.
 * PowerSync sends batches of operations (PUT/PATCH/DELETE) here.
 *
 * Each operation represents a row change from the local SQLite DB.
 * We validate, deduplicate, and insert into Supabase PostgreSQL.
 */
export async function syncUpload(c: Context) {
  try {
    const body = await c.req.json();

    // PowerSync sends: { transactions: [{ ops: [{ op: 'PUT', table, id, data }] }] }
    const { transactions } = body;

    if (!Array.isArray(transactions)) {
      return c.json({ error: 'Invalid payload: transactions array required' }, 400);
    }

    const results: Array<{ table: string; id: string; status: 'ok' | 'error'; error?: string }> = [];

    for (const tx of transactions) {
      for (const op of tx.ops ?? []) {
        const { table, id, data } = op;

        switch (table) {
          case 'orders': {
            // Validate order data
            const parsed = createOrderSchema.safeParse({ ...data, id });
            if (!parsed.success) {
              results.push({ table, id, status: 'error', error: parsed.error.message });
              continue;
            }

            // TODO: Insert into Supabase via Hyperdrive
            // For now, acknowledge receipt
            results.push({ table, id, status: 'ok' });
            break;
          }

          case 'order_lines': {
            // TODO: Insert order lines
            results.push({ table, id, status: 'ok' });
            break;
          }

          default:
            results.push({ table, id, status: 'error', error: `Unknown table: ${table}` });
        }
      }
    }

    return c.json({ results });
  } catch (err) {
    console.error('Sync upload error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
}
