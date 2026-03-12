import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.replace('/(app)/(tabs)/scan');
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#F9FAFB' }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>ScanOrder</Text>
      <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>Sign in to start scanning</Text>

      {error && (
        <View style={{ backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, marginBottom: 16, width: '100%', maxWidth: 400 }}>
          <Text style={{ color: '#DC2626', fontSize: 14 }}>{error}</Text>
        </View>
      )}

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          width: '100%', maxWidth: 400, borderWidth: 1, borderColor: '#D1D5DB',
          borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: '#FFFFFF', fontSize: 16,
        }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          width: '100%', maxWidth: 400, borderWidth: 1, borderColor: '#D1D5DB',
          borderRadius: 8, padding: 12, marginBottom: 24, backgroundColor: '#FFFFFF', fontSize: 16,
        }}
      />

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={{
          width: '100%', maxWidth: 400, backgroundColor: '#2563EB',
          padding: 14, borderRadius: 8, alignItems: 'center', opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Sign In</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
