import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/store/auth';
import { useSession } from '@/store/session';
import Constants from 'expo-constants';

/**
 * Settings screen.
 *
 * Shows account info, event, scanner prefs, sync controls, and logout.
 */
export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const {
    activeSession,
    requireShiftForOrders,
    setRequireShift,
  } = useSession();

  // TODO: These should be persisted with AsyncStorage/MMKV
  // For now they're in-memory only
  // const [scanSound, setScanSound] = useState(true);
  // const [preferHardwareScanner, setPreferHardwareScanner] = useState(false);

  async function handleLogout() {
    await signOut();
    router.replace('/(auth)/login');
  }

  const appVersion = Constants.expoConfig?.version ?? '0.0.0';
  const userRole = (user?.app_metadata?.role as string) ?? 'sales_rep';
  const tenantId = (user?.app_metadata?.tenant_id as string) ?? 'unknown';

  return (
    <ScrollView style={styles.container}>
      {/* Account Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <SettingsRow label="Name" value={user?.user_metadata?.full_name as string ?? 'Unknown'} />
        <SettingsRow label="Email" value={user?.email ?? 'Not set'} />
        <SettingsRow label="Role" value={userRole} />
        <SettingsRow label="Tenant" value={tenantId.slice(0, 8)} />
      </View>

      {/* Active Session */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Shift</Text>
        {activeSession ? (
          <>
            <SettingsRow
              label="Status"
              value="Open"
              valueColor="#16A34A"
            />
            <SettingsRow
              label="Opened"
              value={new Date(activeSession.opened_at).toLocaleTimeString('nl-NL', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            />
            {activeSession.event_id && (
              <SettingsRow label="Event" value={activeSession.event_id.slice(0, 8)} />
            )}
          </>
        ) : (
          <SettingsRow label="Status" value="No open shift" valueColor="#9CA3AF" />
        )}
      </View>

      {/* Scanner Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleLabel}>Require open shift for orders</Text>
            <Text style={styles.toggleHint}>Prevent orders without an active shift</Text>
          </View>
          <Switch
            value={requireShiftForOrders}
            onValueChange={setRequireShift}
            trackColor={{ false: '#D1D5DB', true: '#A5B4FC' }}
            thumbColor={requireShiftForOrders ? '#6366F1' : '#F3F4F6'}
          />
        </View>
      </View>

      {/* Sync Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sync</Text>
        <TouchableOpacity style={styles.actionRow}>
          <Text style={styles.actionLabel}>Sync Status</Text>
          <Text style={styles.actionHint}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow}>
          <Text style={styles.actionLabel}>Pre-show Sync Checklist</Text>
          <Text style={styles.actionHint}>→</Text>
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <SettingsRow label="App Version" value={appVersion} />
        <SettingsRow label="Build" value={__DEV__ ? 'Development' : 'Production'} />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function SettingsRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, valueColor ? { color: valueColor } : undefined]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  rowLabel: { fontSize: 15, color: '#374151' },
  rowValue: { fontSize: 15, color: '#111827', fontWeight: '500' },

  // Toggle row
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  toggleLabel: { fontSize: 15, color: '#374151' },
  toggleHint: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },

  // Action row
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionLabel: { fontSize: 15, color: '#2563EB', fontWeight: '500' },
  actionHint: { fontSize: 15, color: '#9CA3AF' },

  // Logout
  logoutButton: {
    margin: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: { color: '#DC2626', fontSize: 16, fontWeight: '600' },
});
