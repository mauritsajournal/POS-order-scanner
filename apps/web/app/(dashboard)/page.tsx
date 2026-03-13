import { createClient } from '@/lib/supabase/server';
import { formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@scanorder/shared';
import type { OrderStatus } from '@scanorder/shared';

export default async function DashboardHome() {
  const supabase = await createClient();

  // Fetch data for KPIs and recent orders
  const [ordersResult, customersResult] = await Promise.all([
    supabase
      .from('orders')
      .select('id, order_number, customer_id, total, status, created_at, payment_method, synced_at')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase.from('customers').select('id, company_name', { count: 'exact' }),
  ]);

  const orders = ordersResult.data ?? [];
  const customerCount = customersResult.count ?? 0;
  const customers = customersResult.data ?? [];

  // Build customer lookup map
  const customerMap = new Map(customers.map((c) => [c.id, c.company_name]));

  // KPI calculations
  const activeOrders = orders.filter((o) => o.status !== 'cancelled');
  const totalRevenue = activeOrders.reduce((sum, o) => sum + (o.total ?? 0), 0);
  const pendingSync = orders.filter((o) => !o.synced_at).length;

  // Recent orders (last 10)
  const recentOrders = orders.slice(0, 10);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KpiCard
          label="Total Orders"
          value={String(orders.length)}
          color="text-gray-900"
        />
        <KpiCard
          label="Revenue"
          value={formatPrice(totalRevenue)}
          color="text-gray-900"
        />
        <KpiCard
          label="Customers"
          value={String(customerCount)}
          color="text-gray-900"
        />
        <KpiCard
          label="Pending Sync"
          value={String(pendingSync)}
          color={pendingSync > 0 ? 'text-amber-600' : 'text-green-600'}
        />
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <a href="/orders" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all →
          </a>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-lg mb-2">No orders yet</p>
            <p className="text-gray-400 text-sm">
              Start scanning on your mobile device to create orders.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Payment</th>
                  <th className="px-6 py-3 text-right">Total</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => {
                  const status = order.status as OrderStatus;
                  const statusColor = ORDER_STATUS_COLORS[status] ?? '#6B7280';
                  const date = new Date(order.created_at);
                  const dateStr = date.toLocaleDateString('nl-NL', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const customerName = order.customer_id
                    ? customerMap.get(order.customer_id) ?? order.customer_id.slice(0, 8)
                    : null;

                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <a
                          href={`/orders/${order.id}`}
                          className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                        >
                          {order.order_number ?? `#${order.id.slice(0, 8)}`}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {customerName ?? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700">
                            Walk-in
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${statusColor}20`,
                            color: statusColor,
                          }}
                        >
                          {ORDER_STATUS_LABELS[status] ?? status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                        {order.payment_method ?? '-'}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                        {formatPrice(order.total ?? 0)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {dateStr}
                      </td>
                      <td className="px-6 py-4">
                        {order.synced_at ? (
                          <span className="text-xs text-green-600 font-medium">Synced</span>
                        ) : (
                          <span className="text-xs text-amber-600 font-medium">Pending</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}
