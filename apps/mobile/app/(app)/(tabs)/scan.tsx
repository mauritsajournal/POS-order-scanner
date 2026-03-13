import { View, useWindowDimensions, StyleSheet } from 'react-native';
import { SplitPane } from '@/components/layout/SplitPane';
import { PhoneCartSheet } from '@/components/layout/PhoneCartSheet';
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

  // Tablet: side-by-side split pane
  if (isTablet) {
    const leftPane = (
      <View style={{ flex: 1 }}>
        <SyncIndicator />
        <BarcodeScanner onScan={handleScan} />
        <HardwareScannerInput onScan={handleScan} />
        <SearchBar placeholder="Search product or scan..." context="products" />
        <ScanFeedback lastScanned={lastScanned} error={lookupError?.message ?? scanError} />
      </View>
    );

    return <SplitPane left={leftPane} right={<Cart />} ratio={0.55} />;
  }

  // Phone: stacked layout (MOB-A001)
  // Camera viewfinder top ~40%, last-scanned card, collapsible cart bottom sheet
  return (
    <View style={styles.phoneContainer}>
      {/* Status bar */}
      <View style={styles.statusBar}>
        <SyncIndicator compact />
      </View>

      {/* Camera viewfinder - top portion */}
      <View style={styles.cameraSection}>
        <BarcodeScanner onScan={handleScan} />
        <HardwareScannerInput onScan={handleScan} />
      </View>

      {/* Last scanned product card + search */}
      <View style={styles.productSection}>
        <SearchBar placeholder="Zoek product..." context="products" />
        <ScanFeedback lastScanned={lastScanned} error={lookupError?.message ?? scanError} />
      </View>

      {/* Collapsible cart bottom sheet */}
      <PhoneCartSheet />
    </View>
  );
}

const styles = StyleSheet.create({
  phoneContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  statusBar: {
    paddingHorizontal: 8,
    paddingTop: 4,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cameraSection: {
    flex: 4, // ~40% of screen
    backgroundColor: '#000000',
  },
  productSection: {
    flex: 6, // ~60% remaining (with cart sheet overlapping bottom)
    paddingHorizontal: 12,
    paddingTop: 8,
  },
});
