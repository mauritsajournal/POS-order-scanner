import { createClient } from '@/lib/supabase/server';

export default async function CustomersPage() {
  const supabase = await createClient();

  const { data: customers, error } = await supabase
    .from('customers')
    .select(`
      id,
      company_name,
      contact_name,
      email,
      phone,
      vat_number,
      address,
      city,
      postal_code,
      country,
      price_group,
      is_deleted,
      created_at
    `)
    .eq('is_deleted', false)
    .order('company_name', { ascending: true })
    .limit(100);

  // Count orders per customer (separate query)
  const customerIds = customers?.map((c) => c.id) ?? [];
  let orderCounts: Record<string, number> = {};

  if (customerIds.length > 0) {
    const { data: orders } = await supabase
      .from('orders')
      .select('customer_id')
      .in('customer_id', customerIds)
      .eq('is_deleted', false);

    if (orders) {
      orderCounts = orders.reduce((acc: Record<string, number>, o) => {
        const cid = o.customer_id as string;
        acc[cid] = (acc[cid] ?? 0) + 1;
        return acc;
      }, {});
    }
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">
            {customers?.length ?? 0} customers
          </p>
        </div>
        {/* TODO: Add customer button */}
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by company, contact, email..."
          className="w-full max-w-md rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          disabled
        />
      </div>

      {/* Customers table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Price Group
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Orders
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {error ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-red-600">
                  Error loading customers: {error.message}
                </td>
              </tr>
            ) : !customers?.length ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <p className="text-gray-500 font-medium">No customers yet</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Customers will appear here when created from mobile devices.
                  </p>
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  {/* Company */}
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">
                      {customer.company_name}
                    </p>
                    {customer.vat_number && (
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        BTW: {customer.vat_number}
                      </p>
                    )}
                  </td>
                  {/* Contact */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {customer.contact_name ?? '-'}
                  </td>
                  {/* Email */}
                  <td className="px-6 py-4">
                    {customer.email ? (
                      <a
                        href={`mailto:${customer.email}`}
                        className="text-sm text-indigo-600 hover:underline"
                      >
                        {customer.email}
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  {/* Phone */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {customer.phone ?? '-'}
                  </td>
                  {/* Location */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {customer.city
                      ? `${customer.city}${customer.country && customer.country !== 'NL' ? `, ${customer.country}` : ''}`
                      : '-'}
                  </td>
                  {/* Price group */}
                  <td className="px-6 py-4">
                    {customer.price_group ? (
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        {customer.price_group}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Standard</span>
                    )}
                  </td>
                  {/* Order count */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {orderCounts[customer.id] ?? 0}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
