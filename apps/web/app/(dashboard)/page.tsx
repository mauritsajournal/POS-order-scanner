import { createClient } from '@/lib/supabase/server';

export default async function DashboardHome() {
  const supabase = await createClient();

  // Fetch basic counts for KPI cards
  const [ordersResult, customersResult] = await Promise.all([
    supabase.from('orders').select('id, total, status', { count: 'exact' }),
    supabase.from('customers').select('id', { count: 'exact' }),
  ]);

  const orderCount = ordersResult.count ?? 0;
  const customerCount = customersResult.count ?? 0;
  const totalRevenue = (ordersResult.data ?? [])
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total ?? 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{orderCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Revenue</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(totalRevenue / 100)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Customers</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{customerCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Pending Sync</p>
          <p className="text-3xl font-bold text-green-600 mt-1">0</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <a href="/orders" className="text-sm text-blue-600 hover:text-blue-800">View all</a>
        </div>
        <div className="p-6">
          {orderCount === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet. Start scanning on your device!</p>
          ) : (
            <p className="text-gray-500">Orders will appear here once synced from devices.</p>
          )}
        </div>
      </div>
    </div>
  );
}
