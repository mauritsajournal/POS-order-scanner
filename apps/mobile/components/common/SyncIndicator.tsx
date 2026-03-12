import { View, Text, StyleSheet } from 'react-native';
import { useNetwork } from '@/hooks/useNetwork';
import { SYNC_STATUS_COLORS } from '@scanorder/shared';

export function SyncIndicator() {
  const { isOnline } = useNetwork();
  const color = isOnline ? SYNC_STATUS_COLORS.synced : SYNC_STATUS_COLORS.offline;
  const label = isOnline ? 'Online' : 'Offline';

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  text: { fontSize: 12, fontWeight: '600' },
});
