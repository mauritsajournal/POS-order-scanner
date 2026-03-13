import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useOrders } from '@/hooks/useOrders';
import { formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@scanorder/shared';
import type { OrderStatus } from '@scanorder/shared';

export default function OrdersScreen() {
  const { orders, loading, error, refresh, clearError } = useOrders();

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {error && (
        <TouchableOpacity
          onPress={clearError}
          style={{
            backgroundColor: '#FEF2F2', borderColor: '#FECACA', borderWidth: 1,
            margin: 16, marginBottom: 0, padding: 12, borderRadius: 8,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <Text style={{ color: '#DC2626', fontSize: 14, flex: 1 }}>
            {error.message}
          </Text>
          <TouchableOpacity onPress={refresh}>
            <Text style={{ color: '#DC2626', fontWeight: '600', fontSize: 14, marginLeft: 12 }}>
              Retry
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshing={loading}
        onRefresh={refresh}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 64 }}>
            {loading ? (
              <ActivityIndicator size="large" color="#6366F1" />
            ) : (
              <Text style={{ fontSize: 16, color: '#6B7280' }}>
                No orders yet
              </Text>
            )}
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
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 }}>
                <Text style={{ color: '#6B7280', fontSize: 14 }}>
                  {formatPrice(item.total)}
                </Text>
                {!item.customer_id && (
                  <View style={{
                    backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 1,
                    borderRadius: 4,
                  }}>
                    <Text style={{ color: '#92400E', fontSize: 11, fontWeight: '600' }}>
                      Walk-in
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
