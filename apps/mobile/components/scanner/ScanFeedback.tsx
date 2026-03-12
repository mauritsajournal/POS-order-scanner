import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { formatPrice } from '@scanorder/shared';
import type { Product, ProductVariant } from '@scanorder/shared';

interface ScanFeedbackProps {
  lastScanned: {
    product: Product;
    variant?: ProductVariant;
    quantity: number;
  } | null;
  error: string | null;
}

export function ScanFeedback({ lastScanned, error }: ScanFeedbackProps) {
  const [visible, setVisible] = useState(false);
  const opacity = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (lastScanned || error) {
      setVisible(true);
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setVisible(false));
    }
  }, [lastScanned, error, opacity]);

  if (!visible) return null;

  if (error) {
    return (
      <Animated.View style={[styles.container, styles.errorContainer, { opacity }]}>
        <Text style={styles.errorText}>{error}</Text>
      </Animated.View>
    );
  }

  if (!lastScanned) return null;

  const { product, variant, quantity } = lastScanned;
  const price = variant?.price_override ?? product.base_price;
  const displayName = variant ? `${product.name} - ${variant.name}` : product.name;

  return (
    <Animated.View style={[styles.container, styles.successContainer, { opacity }]}>
      <Text style={styles.productName} numberOfLines={1}>{displayName}</Text>
      <Text style={styles.productSku}>{variant?.sku ?? product.sku}</Text>
      <View style={styles.row}>
        <Text style={styles.price}>{formatPrice(price)}</Text>
        <Text style={styles.quantity}>Added (qty: {quantity})</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 8,
    padding: 12,
    borderRadius: 8,
  },
  successContainer: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#065F46',
  },
  productSku: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '500',
    color: '#065F46',
  },
  quantity: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '500',
  },
});
