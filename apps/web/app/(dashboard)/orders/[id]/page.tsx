import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, formatPrice } from '@scanorder/shared';
import type { OrderStatus } from '@scanorder/shared';

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      customers ( company_name, contact_name, email ),
      events ( name, location ),
      users ( full_name ),
      order_lines (
        id, product_name, product_sku, quantity, unit_price,
        discount_pct, tax_rate, line_total, notes
      )
    `)
    .eq('id', id)
    .single();

  if (!order) notFound();

  const status = order.status as OrderStatus;
  const customer = order.customers as { company_name: string; contact_name: string | null; email: string | null } | null;
  const event = order.events as { name: string; location: string | null } | null;
  const user = order.users as { full_name: string } | null;
  const lines = (order.order_lines ?? []) as Array<{
    id: string;
    product_name: string;
    product_sku: string;
    quantity: number;
    unit_price: number;
    discount_pct: number;
    tax_rate: number;
    line_total: number;
    notes: string | null;
  }>;

  return (
    <div>
      <div className="mb-6">
        <Link href="/orders" className="text-sm text-blue-600 hover:underline">
          &larr; Back to Orders
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order {order.order_number ?? order.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Created {new Date(order.created_at).toLocaleDateString('nl-NL', {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
        <span
          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium"
          style={{
            backgroundColor: `${ORDER_STATUS_COLORS[status]}20`,
            color: ORDER_STATUS_COLORS[status],
          }}
        >
          {ORDER_STATUS_LABELS[status]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Line items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lines.map((line) => (
                  <tr key={line.id}>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{line.product_name}</p>
                      <p className="text-xs text-gray-500">{line.product_sku}</p>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">{line.quantity}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      {formatPrice(line.unit_price)}
                      {line.discount_pct > 0 && (
                        <span className="text-xs text-green-600 ml-1">-{line.discount_pct}%</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      {formatPrice(line.line_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-6 py-3 text-right text-sm text-gray-600">Subtotal</td>
                  <td className="px-6 py-3 text-right text-sm font-medium">{formatPrice(order.subtotal)}</td>
                </tr>
                {order.discount_amount > 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-right text-sm text-gray-600">Discount</td>
                    <td className="px-6 py-3 text-right text-sm text-green-600">-{formatPrice(order.discount_amount)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={3} className="px-6 py-3 text-right text-sm text-gray-600">Tax (BTW)</td>
                  <td className="px-6 py-3 text-right text-sm">{formatPrice(order.tax_amount)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-6 py-3 text-right text-sm font-bold text-gray-900">Total</td>
                  <td className="px-6 py-3 text-right text-lg font-bold text-gray-900">{formatPrice(order.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Right: Order details */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Customer</h3>
            {customer ? (
              <>
                <p className="text-sm font-medium">{customer.company_name}</p>
                {customer.contact_name && <p className="text-sm text-gray-600">{customer.contact_name}</p>}
                {customer.email && <p className="text-sm text-gray-600">{customer.email}</p>}
              </>
            ) : (
              <p className="text-sm text-gray-500">Quick Sale (no customer)</p>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Details</h3>
            <dl className="space-y-3 text-sm">
              {event && (
                <div>
                  <dt className="text-gray-600">Event</dt>
                  <dd className="font-medium">{event.name}</dd>
                </div>
              )}
              {user && (
                <div>
                  <dt className="text-gray-600">Sales Rep</dt>
                  <dd className="font-medium">{user.full_name}</dd>
                </div>
              )}
              {order.payment_terms && (
                <div>
                  <dt className="text-gray-600">Payment Terms</dt>
                  <dd className="font-medium">{order.payment_terms}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-600">Sync Status</dt>
                <dd className="font-medium">
                  {order.synced_at ? 'Synced' : 'Pending'}
                </dd>
              </div>
              {order.device_id && (
                <div>
                  <dt className="text-gray-600">Device</dt>
                  <dd className="font-mono text-xs">{order.device_id}</dd>
                </div>
              )}
            </dl>
          </div>

          {order.notes && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
