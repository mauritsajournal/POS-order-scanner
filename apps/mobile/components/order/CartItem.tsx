import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { useCart, type CartLine } from '@/store/cart';
import { formatPrice, lineTotal as calcLineTotal } from '@scanorder/shared';

/**
 * Cart line item component (MOB-M007).
 *
 * Shows product name, SKU, quantity controls, prices.
 * Expandable actions: add note, add per-line discount.
 * Discount and notes saved on the cart line.
 */

interface CartItemProps {
  line: CartLine;
}

export function CartItem({ line }: CartItemProps) {
  const { updateQuantity, removeItem, setLineDiscount, setLineNotes } = useCart();
  const [showActions, setShowActions] = useState(false);
  const [noteInput, setNoteInput] = useState(line.notes ?? '');

  const displayName = line.variant
    ? `${line.product.name} - ${line.variant.name}`
    : line.product.name;

  const total = calcLineTotal(line.unitPrice, line.quantity, line.discountPct);
  const hasDiscount = line.discountPct > 0;
  const hasNotes = line.notes && line.notes.length > 0;

  function handleAddDiscount() {
    Alert.prompt(
      'Korting',
      'Voer kortingspercentage in (0-100)',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Toepassen',
          onPress: (value) => {
            const pct = parseFloat(value ?? '0');
            if (!isNaN(pct) && pct >= 0 && pct <= 100) {
              setLineDiscount(line.id, pct);
            }
          },
        },
      ],
      'plain-text',
      String(line.discountPct || ''),
      'numeric',
    );
  }

  function handleRemoveDiscount() {
    setLineDiscount(line.id, 0);
  }

  function handleSaveNote() {
    const trimmed = noteInput.trim();
    setLineNotes(line.id, trimmed.length > 0 ? trimmed : null);
    setShowActions(false);
  }

  return (
    <View style={styles.container}>
      {/* Main row */}
      <TouchableOpacity
        style={styles.mainRow}
        onPress={() => setShowActions(!showActions)}
        activeOpacity={0.7}
      >
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
          <Text style={styles.sku}>{line.variant?.sku ?? line.product.sku}</Text>
          {hasDiscount && (
            <Text style={styles.discountBadge}>-{line.discountPct}%</Text>
          )}
          {hasNotes && (
            <Text style={styles.notePreview} numberOfLines={1}>
              {line.notes}
            </Text>
          )}
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
          <Text style={[styles.lineTotal, hasDiscount && styles.discountedTotal]}>
            {formatPrice(total)}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Expandable actions */}
      {showActions && (
        <View style={styles.actions}>
          {/* Discount */}
          <View style={styles.actionRow}>
            {hasDiscount ? (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleRemoveDiscount}
              >
                <Text style={styles.actionButtonTextDanger}>
                  Korting verwijderen ({line.discountPct}%)
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleAddDiscount}
              >
                <Text style={styles.actionButtonText}>Korting toevoegen</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Notes */}
          <View style={styles.noteSection}>
            <TextInput
              style={styles.noteInput}
              placeholder="Opmerking toevoegen..."
              placeholderTextColor="#9CA3AF"
              value={noteInput}
              onChangeText={setNoteInput}
              onBlur={handleSaveNote}
              returnKeyType="done"
              onSubmitEditing={handleSaveNote}
              multiline={false}
            />
          </View>

          {/* Remove */}
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeItem(line.id)}
          >
            <Text style={styles.removeButtonText}>Verwijderen</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  info: { flex: 1, marginRight: 8 },
  name: { fontSize: 14, fontWeight: '500', color: '#111827' },
  sku: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  discountBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
    marginTop: 2,
  },
  notePreview: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 2,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  qtyButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyButtonText: { fontSize: 18, fontWeight: '600', color: '#374151' },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    minWidth: 32,
    textAlign: 'center',
  },
  priceCol: { alignItems: 'flex-end', minWidth: 72 },
  unitPrice: { fontSize: 12, color: '#6B7280' },
  lineTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
  },
  discountedTotal: {
    color: '#059669',
  },
  actions: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#EEF2FF',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  actionButtonTextDanger: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  noteSection: {
    marginBottom: 8,
  },
  noteInput: {
    fontSize: 13,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  removeButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  removeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#EF4444',
  },
});
