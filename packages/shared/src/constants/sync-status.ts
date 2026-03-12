export type SyncStatus = 'synced' | 'syncing' | 'pending' | 'error' | 'offline';

export const SYNC_STATUS_LABELS: Record<SyncStatus, string> = {
  synced: 'Synced',
  syncing: 'Syncing...',
  pending: 'Pending',
  error: 'Sync Error',
  offline: 'Offline',
};

export const SYNC_STATUS_COLORS: Record<SyncStatus, string> = {
  synced: '#10B981',   // green
  syncing: '#F59E0B',  // amber
  pending: '#F59E0B',  // amber
  error: '#EF4444',    // red
  offline: '#6B7280',  // gray
};
