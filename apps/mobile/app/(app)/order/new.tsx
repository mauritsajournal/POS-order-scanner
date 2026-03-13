import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { useCart } from '@/store/cart';
import { useAuth } from '@/store/auth';
import { useSession } from '@/store/session';
import {
  formatPrice,
  lineTotal as calcLineTotal,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_TERMS,
  PAYMENT_TERMS_LABELS,
} from '@scanorder/shared';
import type { PaymentMethod, PaymentTerms } from '@scanorder/shared';

export default function NewOrderScreen() {
  const { lines, customer, notes, subtotal, taxAmount, total, clearCart } = useCart();
  const { user } = useAuth();
  const { getSessionId, isShiftOpen, requireShiftForOrders } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('invoice');
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('net_30');

  async function handleSubmit() {
    if (requireShiftForOrders && !isShiftOpen()) {
      Alert.alert('No open shift', 'Please open a shift before creating orders.');
      return;
    }
    if (lines.length === 0) {
      Alert.alert('Empty cart', 'Add at least one product to submit an order.');
      return;
    }

    setSubmitting(true);

    // Build order object for local DB insertion (PowerSync)
    const tenantId = user?.app_metadata?.tenant_id;
    if (!tenantId) {
      Alert.alert('Error', 'Missing tenant context. Please sign out and back in.');
      setSubmitting(false);
      return;
    }

    const orderId = Crypto.randomUUID();
    const order = {
      id: orderId,
      tenant_id: tenantId,
      customer_id: customer?.id ?? null,
      session_id: getSessionId(),
      status: 'draft' as const,
      subtotal: subtotal(),
      tax_amount: taxAmount(),
      total: total(),
      currency: 'EUR',
      payment_method: paymentMethod,
      payment_terms: paymentMethod === 'invoice' ? paymentTerms : null,
      notes,
      lines: lines.map((l, idx) => ({
        id: Crypto.randomUUID(),
        order_id: orderId,
        product_id: l.product.id,
        variant_id: l.variant?.id ?? null,
        sku: l.variant?.sku ?? l.product.sku,
        product_name: l.product.name,
        variant_name: l.variant?.name ?? null,
        unit_price: l.unitPrice,
        quantity: l.quantity,
        discount_pct: l.discountPct,
        tax_rate: l.taxRate,
        line_total: calcLineTotal(l.unitPrice, l.quantity, l.discountPct),
        sort_order: idx,
      })),
    };

    // TODO: Insert into PowerSync local DB
    // await db.insertInto('orders').values(order).execute();
    // for (const line of order.lines) {
    //   await db.insertInto('order_lines').values(line).execute();
    // }

    console.log('[NewOrder] Created order:', order.id, 'payment:', paymentMethod, 'lines:', order.lines.length);

    clearCart();
    setSubmitting(false);

    Alert.alert('Order created', `Order ${orderId.slice(0, 8)}... saved locally.`, [
      { text: 'OK', onPress: () => router.replace('/(app)/(tabs)/orders') },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Confirm Order</Text>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        data={lines}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ListHeaderComponent={
          <>
            {/* Customer Card */}
            <View style={styles.customerCard}>
              {customer ? (
                <>
                  <Text style={styles.customerName}>{customer.company_name}</Text>
                  {customer.contact_name && (
                    <Text style={styles.customerContact}>{customer.contact_name}</Text>
                  )}
                </>
              ) : (
                <>
                  <Text style={styles.customerName}>Walk-in Sale</Text>
                  <Text style={styles.customerContact}>No customer assigned</Text>
                </>
              )}
              {notes && (
                <Text style={[styles.customerContact, { marginTop: 4, fontStyle: 'italic' }]}>
                  {notes}
                </Text>
              )}
            </View>

            {/* Payment Method Selection */}
            <View style={styles.paymentSection}>
              <Text style={styles.sectionLabel}>Payment Method</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.paymentOptions}
              >
                {PAYMENT_METHODS.filter((m) => m !== 'other').map((method) => (
                  <TouchableOpacity
                    key={method}
                    style={[
                      styles.paymentChip,
                      paymentMethod === method && styles.paymentChipActive,
                    ]}
                    onPress={() => setPaymentMethod(method)}
                  >
                    <Text
                      style={[
                        styles.paymentChipText,
                        paymentMethod === method && styles.paymentChipTextActive,
                      ]}
                    >
                      {PAYMENT_METHOD_LABELS[method]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Payment Terms (only for invoice) */}
              {paymentMethod === 'invoice' && (
                <>
                  <Text style={[styles.sectionLabel, { marginTop: 10 }]}>Payment Terms</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.paymentOptions}
                  >
                    {PAYMENT_TERMS.map((terms) => (
                      <TouchableOpacity
                        key={terms}
                        style={[
                          styles.paymentChip,
                          paymentTerms === terms && styles.paymentChipActive,
                        ]}
                        onPress={() => setPaymentTerms(terms)}
                      >
                        <Text
                          style={[
                            styles.paymentChipText,
                            paymentTerms === terms && styles.paymentChipTextActive,
                          ]}
                        >
                          {PAYMENT_TERMS_LABELS[terms]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.lineRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{item.product.name}</Text>
              {item.variant && (
                <Text style={styles.variantName}>{item.variant.name}</Text>
              )}
              <Text style={styles.lineDetail}>
                {item.quantity}x {formatPrice(item.unitPrice)}
              </Text>
            </View>
            <Text style={styles.lineTotal}>
              {formatPrice(calcLineTotal(item.unitPrice, item.quantity, item.discountPct))}
            </Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>{formatPrice(subtotal())}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tax</Text>
          <Text style={styles.totalValue}>{formatPrice(taxAmount())}</Text>
        </View>
        <View style={[styles.totalRow, styles.grandTotal]}>
          <Text style={styles.grandTotalLabel}>Total</Text>
          <Text style={styles.grandTotalValue}>{formatPrice(total())}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Order</Text>
        )}
      </TouchableOpacity>
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
  customerCard: {
    margin: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  customerName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  customerContact: { fontSize: 14, color: '#6B7280', marginTop: 2 },

  // Payment section
  paymentSection: {
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  paymentOptions: {
    gap: 6,
  },
  paymentChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentChipActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  paymentChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  paymentChipTextActive: {
    color: '#4F46E5',
    fontWeight: '600',
  },

  list: { flex: 1 },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  productName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  variantName: { fontSize: 13, color: '#6B7280', marginTop: 1 },
  lineDetail: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  lineTotal: { fontSize: 15, fontWeight: '600', color: '#111827' },
  separator: { height: 1, backgroundColor: '#F3F4F6' },
  totals: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalLabel: { fontSize: 14, color: '#6B7280' },
  totalValue: { fontSize: 14, color: '#374151' },
  grandTotal: { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 8, marginTop: 4 },
  grandTotalLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  grandTotalValue: { fontSize: 16, fontWeight: '700', color: '#111827' },
  submitButton: {
    margin: 12,
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
