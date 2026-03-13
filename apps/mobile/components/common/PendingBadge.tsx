import { View, Text, StyleSheet } from 'react-native';
import { SYNC_STATUS_COLORS } from '@scanorder/shared';

/**
 * Pending upload badge (DES-003).
 *
 * Shows a small colored badge indicating pending items that need sync.
 * Used on the orders tab to show un-synced order count.
 *
 * States:
 * - count > 0: amber badge with count
 * - count === 0: no badge shown
 * - error: red badge with "!" indicator
 */

interface PendingBadgeProps {
  count: number;
  hasError?: boolean;
}

export function PendingBadge({ count, hasError = false }: PendingBadgeProps) {
  if (count === 0 && !hasError) return null;

  const backgroundColor = hasError
    ? SYNC_STATUS_COLORS.error
    : SYNC_STATUS_COLORS.pending;

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={styles.text}>
        {hasError ? '!' : count > 99 ? '99+' : String(count)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
