import { useCallback } from 'react';
import type { Product, ProductVariant } from '@scanorder/shared';

// Stub hook — will query PowerSync local SQLite in production.
// For now, returns null (product not found) until PowerSync is connected.
export function useProductLookup() {
  const lookupByBarcode = useCallback(
    async (
      barcode: string,
    ): Promise<{ product: Product; variant?: ProductVariant } | null> => {
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
    },
    [],
  );

  return { lookupByBarcode };
}
