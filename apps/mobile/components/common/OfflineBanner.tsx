import { View, Text, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { useNetwork } from '@/hooks/useNetwork';
import { SYNC_STATUS_COLORS } from '@scanorder/shared';

/**
 * Offline banner (DES-003).
 *
 * Shows a compact banner at the top of the screen when the device is offline.
 * Non-intrusive: slides in/out with animation. Shows pending upload count
 * when available.
 */

interface OfflineBannerProps {
  pendingCount?: number;
}

export function OfflineBanner({ pendingCount = 0 }: OfflineBannerProps) {
  const { isOnline } = useNetwork();
  const slideAnim = useRef(new Animated.Value(isOnline ? -60 : 0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOnline ? -60 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOnline, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.content}>
        <View style={[styles.dot, { backgroundColor: SYNC_STATUS_COLORS.offline }]} />
        <Text style={styles.text}>
          Offline modus
        </Text>
        {pendingCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {pendingCount} wachtend
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: '#1F2937',
    paddingTop: 50, // safe area
    paddingBottom: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D1D5DB',
  },
  badge: {
    marginLeft: 10,
    backgroundColor: '#F59E0B20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F59E0B40',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
  },
});
