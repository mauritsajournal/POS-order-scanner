import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function SettingsScreen() {
  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB', padding: 16 }}>
      <TouchableOpacity
        onPress={handleLogout}
        style={{
          backgroundColor: '#EF4444', padding: 14, borderRadius: 8,
          alignItems: 'center', marginTop: 32,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
