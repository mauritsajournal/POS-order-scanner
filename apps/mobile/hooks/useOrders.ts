import { useState, useCallback } from 'react';
import type { Order } from '@scanorder/shared';

/**
 * Hook for loading order history.
 *
 * Returns { orders, loading, error, refresh } following the standard
 * data/loading/error pattern. Will query PowerSync local SQLite
 * once connected; for now returns an empty array.
 */
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Query local SQLite via PowerSync
      // const result = await db.selectFrom('orders').orderBy('created_at', 'desc').limit(50);
      // setOrders(result);
      setOrders([]);
    } catch (err) {
      const loadError =
        err instanceof Error ? err : new Error('Failed to load orders');
      setError(loadError);
      console.error('[useOrders] Error:', loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { orders, loading, error, refresh, clearError };
}
