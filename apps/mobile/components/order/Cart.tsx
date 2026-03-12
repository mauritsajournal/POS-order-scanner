import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useCart } from '@/store/cart';
import { CartItem } from './CartItem';
import { formatPrice } from '@scanorder/shared';
import { router } from 'expo-router';

export function Cart() {
  const { lines, customer, subtotal, taxAmount, total, itemCount } = useCart();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Current Order</Text>
        <TouchableOpacity onPress={() => {/* open customer picker */}}>
          <Text style={styles.customerLabel}>
            {customer ? customer.company_name : 'Select Customer'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Line items */}
      {lines.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Scan products to add them here</Text>
        </View>
      ) : (
        <FlatList
          data={lines}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CartItem line={item} />}
          style={styles.list}
        />
      )}

      {/* Totals */}
      {lines.length > 0 && (
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal ({itemCount()} items)</Text>
            <Text style={styles.totalValue}>{formatPrice(subtotal())}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>BTW (21%)</Text>
            <Text style={styles.totalValue}>{formatPrice(taxAmount())}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{formatPrice(total())}</Text>
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => router.push('/(app)/order/new')}
          >
            <Text style={styles.confirmButtonText}>Confirm Order</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  customerLabel: {
    fontSize: 14, color: '#2563EB', marginTop: 4, fontWeight: '500',
  },
  emptyState: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32,
  },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
  list: { flex: 1 },
  totals: {
    padding: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4,
  },
  totalLabel: { fontSize: 14, color: '#6B7280' },
  totalValue: { fontSize: 14, color: '#111827' },
  grandTotal: {
    marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  grandTotalLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  grandTotalValue: { fontSize: 18, fontWeight: '700', color: '#111827' },
  confirmButton: {
    backgroundColor: '#2563EB', padding: 16, borderRadius: 8,
    alignItems: 'center', marginTop: 16,
  },
  confirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
