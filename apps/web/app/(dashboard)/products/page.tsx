import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@scanorder/shared';

export default async function ProductsPage() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      sku,
      barcode,
      name,
      base_price,
      tax_rate,
      stock_qty,
      image_url,
      category,
      is_active,
      created_at,
      updated_at,
      product_variants ( id, sku, name, price_override, stock_qty, is_deleted )
    `)
    .eq('is_deleted', false)
    .order('name', { ascending: true })
    .limit(100);

  // Extract unique categories for filter
  const categories = products
    ? [...new Set(products.map((p) => p.category).filter(Boolean))]
    : [];

  return (
    <div>
      {/* Page header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            {products?.length ?? 0} products
            {categories.length > 0 && ` across ${categories.length} categories`}
          </p>
        </div>
        {/* TODO: Add product button — opens create form */}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by name, SKU, or barcode..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            disabled
          />
        </div>
        {/* Category filter */}
        <select
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          disabled
        >
          <option>All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat ?? ''}>
              {cat}
            </option>
          ))}
        </select>
        {/* Status filter */}
        <select
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          disabled
        >
          <option>All statuses</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      {/* Products table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Variants
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {error ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-red-600">
                  Error loading products: {error.message}
                </td>
              </tr>
            ) : !products?.length ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="text-gray-400 text-4xl mb-3">{'(box)'}</div>
                  <p className="text-gray-500 font-medium">No products yet</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Products will appear here once synced from devices or imported via CSV.
                  </p>
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const variants = (product.product_variants as Array<{
                  id: string;
                  sku: string;
                  name: string;
                  price_override: number | null;
                  stock_qty: number;
                  is_deleted: boolean;
                }>) ?? [];
                const activeVariants = variants.filter((v) => !v.is_deleted);
                const totalStock = activeVariants.length > 0
                  ? activeVariants.reduce((sum, v) => sum + v.stock_qty, 0)
                  : product.stock_qty;

                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    {/* Product name + image */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-md object-cover bg-gray-100"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No img</span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          {product.barcode && (
                            <p className="text-xs text-gray-400 font-mono">{product.barcode}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* SKU */}
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                      {product.sku}
                    </td>
                    {/* Price */}
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatPrice(product.base_price, 'EUR')}
                    </td>
                    {/* Stock */}
                    <td className="px-6 py-4">
                      <StockBadge qty={totalStock} />
                    </td>
                    {/* Category */}
                    <td className="px-6 py-4">
                      {product.category ? (
                        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                          {product.category}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4">
                      {product.is_active ? (
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                          Inactive
                        </span>
                      )}
                    </td>
                    {/* Variants count */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {activeVariants.length > 0 ? (
                        <span className="text-indigo-600 font-medium">
                          {activeVariants.length} variant{activeVariants.length > 1 ? 's' : ''}
                        </span>
                      ) : (
                        '-'
                      )}
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

function StockBadge({ qty }: { qty: number }) {
  if (qty > 10) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        {qty} in stock
      </span>
    );
  }
  if (qty > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        {qty} left
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      Out of stock
    </span>
  );
}
