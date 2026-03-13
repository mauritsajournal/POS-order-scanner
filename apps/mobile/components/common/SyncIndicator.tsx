import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNetwork } from '@/hooks/useNetwork';
import {
  SYNC_STATUS_COLORS,
  SYNC_STATUS_LABELS,
  type SyncStatus,
} from '@scanorder/shared';

/**
 * Sync status indicator (DES-003).
 *
 * Visual states:
 * - synced:  green dot + "Synced"
 * - syncing: amber spinner + "Syncing..."
 * - pending: amber dot + "Pending"
 * - error:   red dot + "Sync Error"
 * - offline: gray dot + "Offline"
 *
 * Used in headers, order cards, and settings.
 */

interface SyncIndicatorProps {
  /** Override the auto-detected status */
  status?: SyncStatus;
  /** Show label text (default: true) */
  showLabel?: boolean;
  /** Compact mode: smaller dot, no label */
  compact?: boolean;
}

export function SyncIndicator({
  status,
  showLabel = true,
  compact = false,
}: SyncIndicatorProps) {
  const { isOnline } = useNetwork();

  // Auto-detect status from network if not provided
  const effectiveStatus: SyncStatus = status ?? (isOnline ? 'synced' : 'offline');
  const color = SYNC_STATUS_COLORS[effectiveStatus];
  const label = SYNC_STATUS_LABELS[effectiveStatus];

  const dotSize = compact ? 6 : 8;
  const isSyncing = effectiveStatus === 'syncing';

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {isSyncing ? (
        <ActivityIndicator
          size="small"
          color={color}
          style={{ marginRight: showLabel ? 6 : 0 }}
        />
      ) : (
        <View
          style={[
            styles.dot,
            {
              backgroundColor: color,
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
            },
          ]}
        />
      )}
      {showLabel && !compact && (
        <Text style={[styles.text, { color }]}>{label}</Text>
      )}
    </View>
  );
}

/**
 * Inline sync label for order cards.
 * Shows "Queued for sync" or "Synced" as a small tag.
 */
export function SyncStatusTag({ status }: { status: SyncStatus }) {
  const color = SYNC_STATUS_COLORS[status];

  const tagLabels: Record<SyncStatus, string> = {
    synced: 'Gesynchroniseerd',
    syncing: 'Synchroniseren...',
    pending: 'Wacht op sync',
    error: 'Synchronisatiefout',
    offline: 'Offline opgeslagen',
  };

  return (
    <View style={[styles.tag, { borderColor: color + '40', backgroundColor: color + '10' }]}>
      <View
        style={[
          styles.tagDot,
          { backgroundColor: color, width: 5, height: 5, borderRadius: 2.5 },
        ]}
      />
      <Text style={[styles.tagText, { color }]}>{tagLabels[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  containerCompact: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  dot: {
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  tagDot: {
    marginRight: 5,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
