import { useCallback, useState } from 'react';
import type { Product, ProductVariant } from '@scanorder/shared';

/**
 * Hook for looking up products by barcode.
 *
 * Returns { lookupByBarcode, loading, error } following the standard
 * data/loading/error pattern. Will query PowerSync local SQLite
 * once connected; for now returns null (not found).
 */
export function useProductLookup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const lookupByBarcode = useCallback(
    async (
      barcode: string,
    ): Promise<{ product: Product; variant?: ProductVariant } | null> => {
      setLoading(true);
      setError(null);

      try {
        // TODO: Query local SQLite via PowerSync
        // const product = await db.selectFrom('products').where('barcode', '=', barcode).first();
        // if (product) return { product };
        // const variant = await db.selectFrom('product_variants').where('barcode', '=', barcode).first();
        // if (variant) {
        //   const product = await db.selectFrom('products').where('id', '=', variant.product_id).first();
        //   return { product, variant };
        // }

        console.log(`[useProductLookup] Looking up barcode: ${barcode}`);
        return null; // Not found — PowerSync not yet connected
      } catch (err) {
        const lookupError =
          err instanceof Error ? err : new Error('Product lookup failed');
        setError(lookupError);
        console.error('[useProductLookup] Error:', lookupError.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const clearError = useCallback(() => setError(null), []);

  return { lookupByBarcode, loading, error, clearError };
}
