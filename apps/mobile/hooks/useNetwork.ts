import { useState, useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import Constants from 'expo-constants';

// API base URL from Expo config, with fallback for dev
const API_BASE_URL =
  Constants.expoConfig?.extra?.apiUrl ?? process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8787';

/**
 * Simple network detection hook.
 * Pings own API /health endpoint instead of third-party services.
 * In production, use @react-native-community/netinfo for richer data.
 */
export function useNetwork() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check connectivity by hitting our own API health endpoint
    async function checkConnection() {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(`${API_BASE_URL}/health`, {
          method: 'GET',
          signal: controller.signal,
        });
        clearTimeout(timeout);
        setIsOnline(response.ok);
      } catch {
        setIsOnline(false);
      }
    }

    checkConnection();

    // Re-check when app comes to foreground
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        checkConnection();
      }
    });

    // Poll every 30 seconds
    const interval = setInterval(checkConnection, 30_000);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, []);

  return { isOnline };
}
