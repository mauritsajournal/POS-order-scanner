import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import { useRef, useCallback, useMemo } from 'react';
import { useCart } from '@/store/cart';
import { Cart } from '@/components/order/Cart';
import { formatPrice, colors } from '@scanorder/shared';

/**
 * Phone cart bottom sheet (MOB-A001).
 *
 * Collapsible bottom sheet showing cart summary when collapsed and
 * full cart when expanded. Draggable with smooth spring animations.
 */

const SCREEN_HEIGHT = Dimensions.get('window').height;
const COLLAPSED_HEIGHT = 80;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.6;
const SNAP_THRESHOLD = 50;

export function PhoneCartSheet() {
  const { lines, total, itemCount } = useCart();
  const count = itemCount();
  const animatedHeight = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;
  const isExpanded = useRef(false);
  const lastHeight = useRef(COLLAPSED_HEIGHT);

  const expand = useCallback(() => {
    isExpanded.current = true;
    lastHeight.current = EXPANDED_HEIGHT;
    Animated.spring(animatedHeight, {
      toValue: EXPANDED_HEIGHT,
      useNativeDriver: false,
      tension: 65,
      friction: 11,
    }).start();
  }, [animatedHeight]);

  const collapse = useCallback(() => {
    isExpanded.current = false;
    lastHeight.current = COLLAPSED_HEIGHT;
    Animated.spring(animatedHeight, {
      toValue: COLLAPSED_HEIGHT,
      useNativeDriver: false,
      tension: 65,
      friction: 11,
    }).start();
  }, [animatedHeight]);

  const toggle = useCallback(() => {
    if (isExpanded.current) {
      collapse();
    } else {
      expand();
    }
  }, [expand, collapse]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dy) > 5,
        onPanResponderMove: (_, gestureState) => {
          const newHeight = lastHeight.current - gestureState.dy;
          const clamped = Math.max(
            COLLAPSED_HEIGHT,
            Math.min(newHeight, EXPANDED_HEIGHT),
          );
          animatedHeight.setValue(clamped);
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > SNAP_THRESHOLD) {
            collapse();
          } else if (gestureState.dy < -SNAP_THRESHOLD) {
            expand();
          } else {
            // Snap back to current state
            if (isExpanded.current) {
              expand();
            } else {
              collapse();
            }
          }
        },
      }),
    [animatedHeight, expand, collapse],
  );

  if (count === 0) return null;

  return (
    <Animated.View style={[styles.container, { height: animatedHeight }]}>
      {/* Drag handle + summary (always visible) */}
      <TouchableOpacity
        onPress={toggle}
        activeOpacity={0.9}
        style={styles.handle}
        {...panResponder.panHandlers}
      >
        <View style={styles.dragBar} />
        <View style={styles.summary}>
          <View style={styles.summaryLeft}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{count}</Text>
            </View>
            <Text style={styles.summaryTitle}>
              {count === 1 ? '1 item' : `${count} items`}
            </Text>
          </View>
          <Text style={styles.summaryTotal}>{formatPrice(total())}</Text>
        </View>
      </TouchableOpacity>

      {/* Expanded cart content */}
      <View style={styles.cartContent}>
        <Cart />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  handle: {
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 16,
  },
  dragBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 8,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: colors.brand[500],
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  summaryTotal: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  cartContent: {
    flex: 1,
  },
});
