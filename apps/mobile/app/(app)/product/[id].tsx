import { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useCart } from '@/store/cart';
import { formatPrice, colors } from '@scanorder/shared';
import type { Product, ProductVariant } from '@scanorder/shared';

/**
 * Product detail screen (MOB-A003).
 *
 * Shows full product info: image, name, SKU, barcode, description, price,
 * stock, and variant selector. "Add to Cart" button with quantity control.
 *
 * Currently uses stub data — will query PowerSync local DB when connected.
 */
export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const { addItem } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // TODO: Replace with PowerSync local query by ID
  // Stub: useProductById(id) will return Product | null from local SQLite
  const product = null as Product | null;
  const variants = [] as ProductVariant[];

  if (!product) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>{'< Back'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>{'?'}</Text>
          <Text style={styles.emptyTitle}>Product not found</Text>
          <Text style={styles.emptySubtitle}>
            Product data will be available once synced from the server.
          </Text>
        </View>
      </View>
    );
  }

  const effectivePrice = selectedVariant?.price_override ?? product.base_price;
  const effectiveStock = selectedVariant?.stock_qty ?? product.stock_qty;
  const effectiveSku = selectedVariant?.sku ?? product.sku;
  const effectiveBarcode = selectedVariant?.barcode ?? product.barcode;
  const taxPct = product.tax_rate / 100; // basis points to percentage

  function handleAddToCart() {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedVariant ?? undefined);
    }
    router.back();
  }

  function incrementQty() {
    setQuantity((q) => Math.min(q + 1, effectiveStock));
  }

  function decrementQty() {
    setQuantity((q) => Math.max(q - 1, 1));
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.name}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Product Image */}
        {product.image_url ? (
          <Image
            source={{ uri: product.image_url }}
            style={[styles.productImage, { width, height: width * 0.6 }]}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { width, height: width * 0.4 }]}>
            <Text style={styles.placeholderText}>No image</Text>
          </View>
        )}

        <View style={styles.detailSection}>
          {/* Name + Brand */}
          <Text style={styles.productName}>{product.name}</Text>

          {/* SKU + Barcode */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>SKU</Text>
              <Text style={styles.metaValue}>{effectiveSku}</Text>
            </View>
            {effectiveBarcode && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Barcode</Text>
                <Text style={styles.metaValue}>{effectiveBarcode}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          {product.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}

          {/* Price */}
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.priceValue}>{formatPrice(effectivePrice)}</Text>
            <Text style={styles.taxInfo}>incl. {taxPct}% BTW</Text>
          </View>

          {/* Stock */}
          <View style={styles.stockSection}>
            <Text style={styles.sectionTitle}>Stock</Text>
            <StockIndicator qty={effectiveStock} />
          </View>

          {/* Variant Selector */}
          {variants.length > 0 && (
            <View style={styles.variantSection}>
              <Text style={styles.sectionTitle}>Variants</Text>
              <View style={styles.variantGrid}>
                {variants.map((v) => (
                  <TouchableOpacity
                    key={v.id}
                    style={[
                      styles.variantChip,
                      selectedVariant?.id === v.id && styles.variantChipActive,
                      v.stock_qty === 0 && styles.variantChipDisabled,
                    ]}
                    onPress={() => setSelectedVariant(v.id === selectedVariant?.id ? null : v)}
                    disabled={v.stock_qty === 0}
                  >
                    <Text
                      style={[
                        styles.variantChipText,
                        selectedVariant?.id === v.id && styles.variantChipTextActive,
                        v.stock_qty === 0 && styles.variantChipTextDisabled,
                      ]}
                    >
                      {v.name}
                    </Text>
                    {v.price_override !== null && v.price_override !== product.base_price && (
                      <Text style={styles.variantPrice}>{formatPrice(v.price_override)}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Category */}
          {product.category && (
            <View style={styles.categorySection}>
              <Text style={styles.metaLabel}>Category</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{product.category}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom: Quantity + Add to Cart */}
      <View style={styles.bottomBar}>
        <View style={styles.quantityControl}>
          <TouchableOpacity onPress={decrementQty} style={styles.qtyButton} disabled={quantity <= 1}>
            <Text style={[styles.qtyButtonText, quantity <= 1 && styles.qtyButtonDisabled]}>-</Text>
          </TouchableOpacity>
          <TextInput
            value={String(quantity)}
            onChangeText={(text) => {
              const n = parseInt(text, 10);
              if (!isNaN(n) && n >= 1 && n <= effectiveStock) setQuantity(n);
            }}
            keyboardType="number-pad"
            style={styles.qtyInput}
          />
          <TouchableOpacity
            onPress={incrementQty}
            style={styles.qtyButton}
            disabled={quantity >= effectiveStock}
          >
            <Text
              style={[
                styles.qtyButtonText,
                quantity >= effectiveStock && styles.qtyButtonDisabled,
              ]}
            >
              +
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.addToCartBtn, effectiveStock === 0 && styles.addToCartDisabled]}
          onPress={handleAddToCart}
          disabled={effectiveStock === 0}
        >
          <Text style={styles.addToCartText}>
            {effectiveStock === 0
              ? 'Out of stock'
              : `Add to Cart - ${formatPrice(effectivePrice * quantity)}`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/** Stock quantity indicator with color coding */
function StockIndicator({ qty }: { qty: number }) {
  const color = qty > 10 ? colors.success[600] : qty > 0 ? colors.warning[600] : colors.error[600];
  const bg = qty > 10 ? colors.success[50] : qty > 0 ? colors.warning[50] : colors.error[50];
  const label = qty > 0 ? `${qty} in stock` : 'Out of stock';

  return (
    <View style={[styles.stockBadge, { backgroundColor: bg }]}>
      <View style={[styles.stockDot, { backgroundColor: color }]} />
      <Text style={[styles.stockText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: { paddingVertical: 4, paddingRight: 8 },
  backText: { fontSize: 16, color: colors.brand[500], fontWeight: '600' },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 120 },

  // Image
  productImage: { backgroundColor: '#F3F4F6' },
  imagePlaceholder: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { fontSize: 14, color: '#9CA3AF' },

  // Detail sections
  detailSection: { padding: 20 },
  productName: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 12 },

  metaRow: { flexDirection: 'row', gap: 24, marginBottom: 16 },
  metaItem: {},
  metaLabel: { fontSize: 11, fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 },
  metaValue: { fontSize: 14, color: '#374151', marginTop: 2 },

  descriptionSection: { marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  description: { fontSize: 14, lineHeight: 20, color: '#4B5563' },

  priceSection: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 16 },
  priceLabel: { fontSize: 13, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  priceValue: { fontSize: 28, fontWeight: '800', color: '#111827' },
  taxInfo: { fontSize: 12, color: '#9CA3AF' },

  stockSection: { marginBottom: 16 },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  stockDot: { width: 8, height: 8, borderRadius: 4 },
  stockText: { fontSize: 13, fontWeight: '600' },

  // Variants
  variantSection: { marginBottom: 16 },
  variantGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  variantChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  variantChipActive: {
    borderColor: colors.brand[500],
    backgroundColor: colors.brand[50],
  },
  variantChipDisabled: {
    opacity: 0.4,
    backgroundColor: '#F3F4F6',
  },
  variantChipText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  variantChipTextActive: { color: colors.brand[700] },
  variantChipTextDisabled: { color: '#9CA3AF', textDecorationLine: 'line-through' },
  variantPrice: { fontSize: 11, color: '#6B7280', marginTop: 2 },

  // Category
  categorySection: { marginBottom: 16 },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.brand[50],
    marginTop: 4,
  },
  categoryText: { fontSize: 12, fontWeight: '600', color: colors.brand[600] },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    overflow: 'hidden',
  },
  qtyButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  qtyButtonText: { fontSize: 20, fontWeight: '700', color: '#374151' },
  qtyButtonDisabled: { color: '#D1D5DB' },
  qtyInput: {
    width: 44,
    height: 40,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E5E7EB',
  },
  addToCartBtn: {
    flex: 1,
    height: 44,
    backgroundColor: colors.brand[500],
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartDisabled: { backgroundColor: '#D1D5DB' },
  addToCartText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },

  // Empty state
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 16, color: '#D1D5DB' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
});
