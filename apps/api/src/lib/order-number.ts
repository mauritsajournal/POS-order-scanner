/**
 * Order Number Sequence Generator
 *
 * Generates sequential order numbers per tenant.
 * Format: SO-NNNN (e.g., SO-0001, SO-0002)
 *
 * Uses PostgreSQL row-level locking (SELECT ... FOR UPDATE) to ensure
 * atomic increments even under concurrent order submissions.
 *
 * The sequence is stored in the `tenants` table via a `next_order_number`
 * column, or in a dedicated `order_sequences` table. Since we can't add
 * columns to the DB right now (BLOCKED), we use an `order_sequences` table
 * approach with an upsert pattern.
 *
 * SQL for the table (to be added to the migration):
 *
 *   CREATE TABLE IF NOT EXISTS order_sequences (
 *     tenant_id UUID PRIMARY KEY REFERENCES tenants(id),
 *     prefix TEXT NOT NULL DEFAULT 'SO',
 *     next_number INTEGER NOT NULL DEFAULT 1
 *   );
 */

/** Default prefix for order numbers */
const DEFAULT_PREFIX = 'SO';

/** Number of digits to zero-pad */
const PAD_LENGTH = 4;

/**
 * Format an order number from prefix and sequence number.
 * e.g., formatOrderNumber('SO', 42) => 'SO-0042'
 */
export function formatOrderNumber(prefix: string, sequenceNumber: number): string {
  return `${prefix}-${String(sequenceNumber).padStart(PAD_LENGTH, '0')}`;
}

/**
 * Generate the next order number for a tenant using an atomic DB operation.
 *
 * Uses a single SQL statement with INSERT ... ON CONFLICT (upsert) and
 * RETURNING to atomically get-and-increment the sequence in one round trip.
 * This avoids race conditions under concurrent order submissions.
 *
 * @param db - A database client that can execute raw SQL (Drizzle sql`` or pg client)
 * @param tenantId - The tenant UUID
 * @param prefix - Order number prefix (default: 'SO')
 * @returns The next order number string (e.g., 'SO-0042')
 */
export async function generateOrderNumber(
  db: DatabaseClient,
  tenantId: string,
  prefix: string = DEFAULT_PREFIX
): Promise<string> {
  // Atomic upsert + increment. If the row doesn't exist, insert with next_number = 1
  // and return 1. If it exists, increment and return the old value (pre-increment).
  //
  // This is a single atomic statement — no transaction wrapper needed.
  const result = await db.execute(
    `INSERT INTO order_sequences (tenant_id, prefix, next_number)
     VALUES ($1, $2, 2)
     ON CONFLICT (tenant_id) DO UPDATE
       SET next_number = order_sequences.next_number + 1
     RETURNING next_number - 1 AS current_number`,
    [tenantId, prefix]
  );

  const currentNumber = result.rows[0]?.current_number as number;
  return formatOrderNumber(prefix, currentNumber);
}

/**
 * Get the current (last assigned) order number for a tenant without incrementing.
 */
export async function getCurrentOrderNumber(
  db: DatabaseClient,
  tenantId: string,
  prefix: string = DEFAULT_PREFIX
): Promise<string | null> {
  const result = await db.execute(
    `SELECT next_number FROM order_sequences WHERE tenant_id = $1`,
    [tenantId]
  );

  if (result.rows.length === 0) {
    return null; // No orders yet for this tenant
  }

  const nextNumber = result.rows[0]!.next_number as number;
  // Current = next - 1, but if next is 1, no orders have been assigned yet
  if (nextNumber <= 1) {
    return null;
  }

  return formatOrderNumber(prefix, nextNumber - 1);
}

/**
 * SQL to create the order_sequences table.
 * Include this in the Drizzle migration when DB access is available.
 */
export const ORDER_SEQUENCES_DDL = `
CREATE TABLE IF NOT EXISTS order_sequences (
  tenant_id UUID PRIMARY KEY REFERENCES tenants(id),
  prefix TEXT NOT NULL DEFAULT 'SO',
  next_number INTEGER NOT NULL DEFAULT 1
);
`;

/**
 * Minimal database client interface.
 * Compatible with both Drizzle raw queries and direct pg clients.
 */
export interface DatabaseClient {
  execute(query: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
}
