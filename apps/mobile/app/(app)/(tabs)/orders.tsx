import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useOrders } from '@/hooks/useOrders';
import { formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@scanorder/shared';
import type { OrderStatus } from '@scanorder/shared';

export default function OrdersScreen() {
  const { orders, loading } = useOrders();

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 64 }}>
            <Text style={{ fontSize: 16, color: '#6B7280' }}>
              {loading ? 'Loading orders...' : 'No orders yet'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const status = item.status as OrderStatus;
          return (
            <TouchableOpacity
              style={{
                backgroundColor: '#FFFFFF', borderRadius: 8, padding: 16,
                marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB',
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '600' }}>
                  {item.order_number ?? `#${item.id.slice(0, 8)}`}
                </Text>
                <View style={{
                  backgroundColor: `${ORDER_STATUS_COLORS[status]}20`,
                  paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12,
                }}>
                  <Text style={{ color: ORDER_STATUS_COLORS[status], fontSize: 12, fontWeight: '600' }}>
                    {ORDER_STATUS_LABELS[status]}
                  </Text>
                </View>
              </View>
              <Text style={{ color: '#6B7280', marginTop: 4, fontSize: 14 }}>
                {formatPrice(item.total)}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
