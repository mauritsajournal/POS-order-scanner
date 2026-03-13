import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useCart } from '@/store/cart';
import { formatPrice } from '@scanorder/shared';
import type { Product } from '@scanorder/shared';

type ViewMode = 'grid' | 'list';

/**
 * Product catalog browsing screen.
 *
 * Features:
 * - Grid/list toggle
 * - Category filter tabs
 * - Search by name/SKU
 * - Tap to view detail (TODO), "+" button to add to cart
 * - Uses FlashList for 60fps performance with large catalogs
 *
 * Data is currently stubbed — will use PowerSync local SQLite when connected.
 */
export default function CatalogScreen() {
  const { width } = useWindowDimensions();
  const { addItem } = useCart();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // TODO: Replace with PowerSync local query
  // For now, empty array — products will appear when PowerSync syncs
  const allProducts: Product[] = [];

  // Extract unique categories from products
  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const p of allProducts) {
      if (p.category) cats.add(p.category);
    }
    return ['All', ...Array.from(cats).sort()];
  }, [allProducts]);

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    let products = allProducts.filter((p) => p.is_active && !p.is_deleted);

    if (selectedCategory && selectedCategory !== 'All') {
      products = products.filter((p) => p.category === selectedCategory);
    }

    if (search.length >= 2) {
      const q = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.barcode?.includes(q) ?? false),
      );
    }

    return products;
  }, [allProducts, selectedCategory, search]);

  // Grid column count based on screen width
  const numColumns = viewMode === 'grid' ? (width >= 1024 ? 4 : width >= 768 ? 3 : 2) : 1;
  const gridGap = 8;
  const tileWidth = viewMode === 'grid'
    ? (width - 16 * 2 - gridGap * (numColumns - 1)) / numColumns
    : width - 32;

  const handleAddToCart = useCallback(
    (product: Product) => {
      addItem(product);
    },
    [addItem],
  );

  const renderGridItem = useCallback(
    ({ item }: { item: Product }) => (
      <TouchableOpacity
        style={[styles.gridTile, { width: tileWidth }]}
        activeOpacity={0.7}
        onPress={() => router.push(`/product/${item.id}`)}
      >
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={[styles.gridImage, { width: tileWidth, height: tileWidth * 0.75 }]}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.gridImagePlaceholder,
              { width: tileWidth, height: tileWidth * 0.75 },
            ]}
          >
            <Text style={styles.placeholderText}>No image</Text>
          </View>
        )}
        <View style={styles.gridInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productSku}>{item.sku}</Text>
          <View style={styles.gridFooter}>
            <Text style={styles.price}>{formatPrice(item.base_price)}</Text>
            <StockBadge qty={item.stock_qty} />
          </View>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddToCart(item)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    ),
    [tileWidth, handleAddToCart],
  );

  const renderListItem = useCallback(
    ({ item }: { item: Product }) => (
      <TouchableOpacity style={styles.listRow} activeOpacity={0.7} onPress={() => router.push(`/product/${item.id}`)}>
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={styles.listImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.listImage, styles.gridImagePlaceholder]}>
            <Text style={[styles.placeholderText, { fontSize: 10 }]}>No img</Text>
          </View>
        )}
        <View style={styles.listInfo}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.productSku}>{item.sku}</Text>
          <View style={styles.listMeta}>
            <Text style={styles.price}>{formatPrice(item.base_price)}</Text>
            <StockBadge qty={item.stock_qty} />
          </View>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddToCart(item)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    ),
    [handleAddToCart],
  );

  return (
    <View style={styles.container}>
      {/* Search + View Toggle */}
      <View style={styles.toolbar}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search products..."
          style={styles.searchInput}
          placeholderTextColor="#9CA3AF"
          clearButtonMode="while-editing"
        />
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'grid' && styles.toggleBtnActive]}
            onPress={() => setViewMode('grid')}
          >
            <Text style={[styles.toggleText, viewMode === 'grid' && styles.toggleTextActive]}>
              Grid
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
              List
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Filter Tabs */}
      {categories.length > 1 && (
        <View style={styles.categoryBar}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryTab,
                (cat === 'All' ? !selectedCategory : selectedCategory === cat) &&
                  styles.categoryTabActive,
              ]}
              onPress={() => setSelectedCategory(cat === 'All' ? null : cat)}
            >
              <Text
                style={[
                  styles.categoryTabText,
                  (cat === 'All' ? !selectedCategory : selectedCategory === cat) &&
                    styles.categoryTabTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Product List */}
      <FlashList
        data={filteredProducts}
        renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? numColumns : 1}
        estimatedItemSize={viewMode === 'grid' ? 220 : 80}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No products loaded</Text>
            <Text style={styles.emptySubtitle}>
              Products will appear here once synced from the server.
            </Text>
          </View>
        }
      />
    </View>
  );
}

/** Stock quantity badge with color coding */
function StockBadge({ qty }: { qty: number }) {
  const color = qty > 10 ? '#16A34A' : qty > 0 ? '#D97706' : '#DC2626';
  const bg = qty > 10 ? '#F0FDF4' : qty > 0 ? '#FFFBEB' : '#FEF2F2';
  const label = qty > 0 ? `${qty} in stock` : 'Out of stock';

  return (
    <View style={[styles.stockBadge, { backgroundColor: bg }]}>
      <Text style={[styles.stockText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: '#111827',
  },
  viewToggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  toggleBtnActive: {
    backgroundColor: '#6366F1',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  categoryBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 6,
    flexWrap: 'wrap',
  },
  categoryTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  categoryTabActive: {
    backgroundColor: '#6366F1',
  },
  categoryTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
  },

  // Grid view
  gridTile: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
    marginRight: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  gridImage: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  gridImagePlaceholder: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  gridInfo: {
    padding: 8,
  },
  gridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  productSku: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  // List view
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 6,
    padding: 10,
    gap: 12,
  },
  listImage: {
    width: 56,
    height: 56,
    borderRadius: 6,
  },
  listInfo: {
    flex: 1,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },

  // Add to cart button
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 8,
    bottom: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },

  // Stock badge
  stockBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
