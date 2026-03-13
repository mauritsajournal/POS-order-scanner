import { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useOrders } from '@/hooks/useOrders';
import {
  formatPrice,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_STATUSES,
} from '@scanorder/shared';
import type { OrderStatus } from '@scanorder/shared';

type SortField = 'date' | 'total' | 'customer';

/**
 * Order history screen with filtering and sorting.
 *
 * Supports filter by status, sort by date/total/customer,
 * pull-to-refresh, and tap to navigate to order detail.
 */
export default function OrdersScreen() {
  const { orders, loading, error, refresh, clearError } = useOrders();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Filter by status
    if (statusFilter) {
      result = result.filter((o) => o.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortField) {
        case 'total':
          return b.total - a.total;
        case 'customer':
          return (a.customer_id ?? 'zzz').localeCompare(b.customer_id ?? 'zzz');
        case 'date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [orders, statusFilter, sortField]);

  const handleOrderPress = useCallback((orderId: string) => {
    router.push(`/(app)/order/${orderId}`);
  }, []);

  return (
    <View style={styles.container}>
      {/* Error Banner */}
      {error && (
        <TouchableOpacity onPress={clearError} style={styles.errorBanner}>
          <Text style={styles.errorText}>{error.message}</Text>
          <TouchableOpacity onPress={refresh}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* Status Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterBar}
      >
        <TouchableOpacity
          style={[styles.filterChip, !statusFilter && styles.filterChipActive]}
          onPress={() => setStatusFilter(null)}
        >
          <Text style={[styles.filterChipText, !statusFilter && styles.filterChipTextActive]}>
            All ({orders.length})
          </Text>
        </TouchableOpacity>
        {ORDER_STATUSES.map((status) => {
          const count = orders.filter((o) => o.status === status).length;
          if (count === 0) return null;
          return (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                statusFilter === status && styles.filterChipActive,
              ]}
              onPress={() => setStatusFilter(statusFilter === status ? null : status)}
            >
              <View
                style={[styles.statusDot, { backgroundColor: ORDER_STATUS_COLORS[status] }]}
              />
              <Text
                style={[
                  styles.filterChipText,
                  statusFilter === status && styles.filterChipTextActive,
                ]}
              >
                {ORDER_STATUS_LABELS[status]} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Sort Bar */}
      <View style={styles.sortBar}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        {(['date', 'total', 'customer'] as SortField[]).map((field) => (
          <TouchableOpacity
            key={field}
            style={[styles.sortChip, sortField === field && styles.sortChipActive]}
            onPress={() => setSortField(field)}
          >
            <Text
              style={[styles.sortChipText, sortField === field && styles.sortChipTextActive]}
            >
              {field === 'date' ? 'Date' : field === 'total' ? 'Total' : 'Customer'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Order List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshing={loading}
        onRefresh={refresh}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {loading ? (
              <ActivityIndicator size="large" color="#6366F1" />
            ) : (
              <>
                <Text style={styles.emptyTitle}>
                  {statusFilter ? 'No matching orders' : 'No orders yet'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {statusFilter
                    ? 'Try a different filter or create a new order.'
                    : 'Scan products to create your first order.'}
                </Text>
              </>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const status = item.status as OrderStatus;
          const date = new Date(item.created_at);
          const dateStr = date.toLocaleDateString('nl-NL', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <TouchableOpacity
              style={styles.orderCard}
              onPress={() => handleOrderPress(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>
                  {item.order_number ?? `#${item.id.slice(0, 8)}`}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${ORDER_STATUS_COLORS[status]}20` },
                  ]}
                >
                  <Text style={[styles.statusText, { color: ORDER_STATUS_COLORS[status] }]}>
                    {ORDER_STATUS_LABELS[status]}
                  </Text>
                </View>
              </View>

              <View style={styles.orderMeta}>
                <Text style={styles.dateText}>{dateStr}</Text>
                {!item.customer_id && (
                  <View style={styles.walkinBadge}>
                    <Text style={styles.walkinText}>Walk-in</Text>
                  </View>
                )}
              </View>

              <View style={styles.orderFooter}>
                <Text style={styles.totalText}>{formatPrice(item.total)}</Text>
                {item.synced_at ? (
                  <Text style={styles.syncedText}>Synced</Text>
                ) : (
                  <Text style={styles.pendingText}>Pending sync</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  // Error banner
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    margin: 12,
    marginBottom: 0,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: { color: '#DC2626', fontSize: 14, flex: 1 },
  retryText: { color: '#DC2626', fontWeight: '600', fontSize: 14, marginLeft: 12 },

  // Filter bar
  filterBar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  filterChipText: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  filterChipTextActive: { color: '#FFFFFF' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },

  // Sort bar
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 4,
    gap: 6,
  },
  sortLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  sortChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  sortChipActive: { backgroundColor: '#E0E7FF' },
  sortChipText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  sortChipTextActive: { color: '#4F46E5', fontWeight: '600' },

  // Order card
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: { fontSize: 16, fontWeight: '600', color: '#111827' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  dateText: { fontSize: 13, color: '#6B7280' },
  walkinBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  walkinText: { color: '#92400E', fontSize: 11, fontWeight: '600' },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  totalText: { fontSize: 15, fontWeight: '700', color: '#111827' },
  syncedText: { fontSize: 12, color: '#16A34A', fontWeight: '500' },
  pendingText: { fontSize: 12, color: '#D97706', fontWeight: '500' },

  // Empty state
  emptyState: { alignItems: 'center', paddingTop: 64, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});
