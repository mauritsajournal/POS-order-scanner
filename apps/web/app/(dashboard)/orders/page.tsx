import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, formatPrice } from '@scanorder/shared';
import type { OrderStatus } from '@scanorder/shared';

export default async function OrdersPage() {
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      total,
      currency,
      created_at,
      synced_at,
      customers ( company_name ),
      events ( name )
    `)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {error ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-red-600">
                  Error loading orders: {error.message}
                </td>
              </tr>
            ) : !orders?.length ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No orders yet. Orders will appear here when synced from devices.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const status = order.status as OrderStatus;
                const customerData = order.customers as unknown;
                const customer = Array.isArray(customerData) ? customerData[0] as { company_name: string } | undefined : customerData as { company_name: string } | null;
                const eventData = order.events as unknown;
                const event = Array.isArray(eventData) ? eventData[0] as { name: string } | undefined : eventData as { name: string } | null;
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link href={`/orders/${order.id}`} className="text-blue-600 hover:underline font-medium">
                        {order.order_number ?? order.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {customer?.company_name ?? 'Quick Sale'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {event?.name ?? '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatPrice(order.total, (order.currency ?? 'EUR') as 'EUR')}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${ORDER_STATUS_COLORS[status]}20`,
                          color: ORDER_STATUS_COLORS[status],
                        }}
                      >
                        {ORDER_STATUS_LABELS[status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('nl-NL')}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
