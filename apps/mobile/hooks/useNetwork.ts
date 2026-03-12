import { useState, useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

// Simple network detection hook.
// In production, use @react-native-community/netinfo for richer data.
export function useNetwork() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check connectivity by attempting a lightweight fetch
    async function checkConnection() {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        await fetch('https://www.google.com/generate_204', {
          method: 'HEAD',
          signal: controller.signal,
        });
        clearTimeout(timeout);
        setIsOnline(true);
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
