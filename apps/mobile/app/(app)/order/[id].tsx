import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  formatPrice,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from '@scanorder/shared';
import type { Order, OrderLine, OrderStatus } from '@scanorder/shared';

/**
 * Order detail screen.
 *
 * Shows full order info: header, line items, totals, notes, sync status.
 * Supports cancelling draft orders.
 *
 * Data currently stubbed — will query PowerSync local SQLite when connected.
 */
export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // TODO: Query order from local SQLite via PowerSync
  // const { order } = useOrderById(id);
  // const { lines } = useOrderLines(id);
  const [order] = useState<Order | null>(null);
  const [lines] = useState<OrderLine[]>([]);

  const handleCancel = useCallback(() => {
    if (!order || order.status !== 'draft') return;

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This cannot be undone.',
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Cancel Order',
          style: 'destructive',
          onPress: () => {
            // TODO: Update order status in PowerSync
            // db.update('orders').set({ status: 'cancelled' }).where('id', '=', id);
            Alert.alert('Cancelled', 'Order has been cancelled.');
            router.back();
          },
        },
      ],
    );
  }, [order, id]);

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Order Detail</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Order not found</Text>
          <Text style={styles.emptySubtitle}>
            Order data will be available once PowerSync is connected.
          </Text>
        </View>
      </View>
    );
  }

  const status = order.status as OrderStatus;
  const createdDate = new Date(order.created_at).toLocaleDateString('nl-NL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {order.order_number ?? `#${order.id.slice(0, 8)}`}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Status & Sync */}
        <View style={styles.section}>
          <View style={styles.statusRow}>
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
            {order.synced_at ? (
              <Text style={styles.syncedLabel}>Synced</Text>
            ) : (
              <Text style={styles.pendingLabel}>Pending sync</Text>
            )}
          </View>
        </View>

        {/* Order Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Info</Text>
          <InfoRow label="Date" value={createdDate} />
          <InfoRow
            label="Customer"
            value={order.customer_id ? order.customer_id.slice(0, 8) : 'Walk-in'}
          />
          {order.event_id && (
            <InfoRow label="Event" value={order.event_id.slice(0, 8)} />
          )}
          <InfoRow label="Currency" value={order.currency} />
          {order.payment_method && (
            <InfoRow label="Payment" value={order.payment_method} />
          )}
        </View>

        {/* Line Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Line Items ({lines.length})
          </Text>
          {lines.map((line) => (
            <View key={line.id} style={styles.lineItem}>
              <View style={styles.lineInfo}>
                <Text style={styles.lineName}>{line.product_name}</Text>
                <Text style={styles.lineSku}>{line.product_sku}</Text>
                <Text style={styles.lineQty}>
                  {line.quantity}x {formatPrice(line.unit_price)}
                  {line.discount_pct > 0 ? ` (-${line.discount_pct}%)` : ''}
                </Text>
              </View>
              <Text style={styles.lineTotal}>{formatPrice(line.line_total)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Totals</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatPrice(order.subtotal)}</Text>
          </View>
          {order.discount_amount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount</Text>
              <Text style={[styles.totalValue, { color: '#16A34A' }]}>
                -{formatPrice(order.discount_amount)}
              </Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax (BTW)</Text>
            <Text style={styles.totalValue}>{formatPrice(order.tax_amount)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{formatPrice(order.total)}</Text>
          </View>
        </View>

        {/* Notes */}
        {order.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{order.notes}</Text>
          </View>
        )}

        {/* Actions */}
        {order.status === 'draft' && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: { fontSize: 16, color: '#2563EB', fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  content: { flex: 1 },

  // Section
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  // Status
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 14, fontWeight: '600' },
  syncedLabel: { fontSize: 13, color: '#16A34A', fontWeight: '500' },
  pendingLabel: { fontSize: 13, color: '#D97706', fontWeight: '500' },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: { fontSize: 14, color: '#6B7280' },
  infoValue: { fontSize: 14, color: '#111827', fontWeight: '500' },

  // Line items
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lineInfo: { flex: 1 },
  lineName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  lineSku: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  lineQty: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  lineTotal: { fontSize: 15, fontWeight: '600', color: '#111827', marginLeft: 12 },

  // Totals
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  totalLabel: { fontSize: 14, color: '#6B7280' },
  totalValue: { fontSize: 14, color: '#374151' },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    marginTop: 4,
  },
  grandTotalLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  grandTotalValue: { fontSize: 16, fontWeight: '700', color: '#111827' },

  // Notes
  notesText: { fontSize: 14, color: '#374151', lineHeight: 20 },

  // Actions
  actions: { padding: 16 },
  cancelButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: { color: '#DC2626', fontSize: 15, fontWeight: '600' },

  // Empty state
  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});
