import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useCart, type CartLine } from '@/store/cart';
import { formatPrice } from '@scanorder/shared';

interface CartItemProps {
  line: CartLine;
}

export function CartItem({ line }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const displayName = line.variant
    ? `${line.product.name} - ${line.variant.name}`
    : line.product.name;
  const lineTotal = line.unitPrice * line.quantity;

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
        <Text style={styles.sku}>{line.variant?.sku ?? line.product.sku}</Text>
      </View>

      <View style={styles.quantityRow}>
        <TouchableOpacity
          style={styles.qtyButton}
          onPress={() => updateQuantity(line.id, line.quantity - 1)}
        >
          <Text style={styles.qtyButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantity}>{line.quantity}</Text>
        <TouchableOpacity
          style={styles.qtyButton}
          onPress={() => updateQuantity(line.id, line.quantity + 1)}
        >
          <Text style={styles.qtyButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.priceCol}>
        <Text style={styles.unitPrice}>{formatPrice(line.unitPrice)}</Text>
        <Text style={styles.lineTotal}>{formatPrice(lineTotal)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  info: { flex: 1, marginRight: 8 },
  name: { fontSize: 14, fontWeight: '500', color: '#111827' },
  sku: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  qtyButton: {
    width: 36, height: 36, borderRadius: 8, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center',
  },
  qtyButtonText: { fontSize: 18, fontWeight: '600', color: '#374151' },
  quantity: {
    fontSize: 16, fontWeight: '600', color: '#111827',
    minWidth: 32, textAlign: 'center',
  },
  priceCol: { alignItems: 'flex-end', minWidth: 72 },
  unitPrice: { fontSize: 12, color: '#6B7280' },
  lineTotal: { fontSize: 14, fontWeight: '600', color: '#111827', marginTop: 2 },
});
