import { View, useWindowDimensions } from 'react-native';
import { SplitPane } from '@/components/layout/SplitPane';
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner';
import { HardwareScannerInput } from '@/components/scanner/HardwareScannerInput';
import { ScanFeedback } from '@/components/scanner/ScanFeedback';
import { Cart } from '@/components/order/Cart';
import { SearchBar } from '@/components/common/SearchBar';
import { SyncIndicator } from '@/components/common/SyncIndicator';
import { useCart } from '@/store/cart';
import { useProductLookup } from '@/hooks/useProducts';
import { useState, useCallback } from 'react';
import type { Product, ProductVariant } from '@scanorder/shared';

export default function ScanScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { addItem } = useCart();
  const { lookupByBarcode, error: lookupError } = useProductLookup();
  const [lastScanned, setLastScanned] = useState<{
    product: Product;
    variant?: ProductVariant;
    quantity: number;
  } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleScan = useCallback(async (barcode: string) => {
    setScanError(null);
    const result = await lookupByBarcode(barcode);

    if (!result) {
      setScanError(`Product not found: ${barcode}`);
      setLastScanned(null);
      return;
    }

    const qty = addItem(result.product, result.variant);
    setLastScanned({ product: result.product, variant: result.variant, quantity: qty });
  }, [lookupByBarcode, addItem]);

  const leftPane = (
    <View style={{ flex: 1 }}>
      <SyncIndicator />
      <BarcodeScanner onScan={handleScan} />
      <HardwareScannerInput onScan={handleScan} />
      <SearchBar placeholder="Search product or scan..." context="products" />
      <ScanFeedback lastScanned={lastScanned} error={lookupError?.message ?? scanError} />
    </View>
  );

  const rightPane = <Cart />;

  if (isTablet) {
    return <SplitPane left={leftPane} right={rightPane} ratio={0.55} />;
  }

  // Phone: stacked layout
  return (
    <View style={{ flex: 1 }}>
      {leftPane}
      {rightPane}
    </View>
  );
}
