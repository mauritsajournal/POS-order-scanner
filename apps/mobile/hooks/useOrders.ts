import { useState } from 'react';
import type { Order } from '@scanorder/shared';

// Stub hook — will query PowerSync local SQLite in production.
export function useOrders() {
  const [orders] = useState<Order[]>([]);
  const [loading] = useState(false);

  // TODO: Query local SQLite via PowerSync
  // useEffect(() => {
  //   const result = db.selectFrom('orders').orderBy('created_at', 'desc').limit(50);
  //   setOrders(result);
  // }, []);

  return { orders, loading };
}
