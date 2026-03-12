import { useRef, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import * as Haptics from 'expo-haptics';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const device = useCameraDevice('back');
  const lastScannedRef = useRef<string>('');
  const lastScannedTimeRef = useRef<number>(0);

  const codeScanner = useCodeScanner({
    codeTypes: ['ean-13', 'ean-8', 'upc-a', 'upc-e', 'code-128', 'code-39', 'qr'],
    onCodeScanned: useCallback((codes) => {
      if (codes.length === 0) return;

      const barcode = codes[0]?.value;
      if (!barcode) return;

      const now = Date.now();
      // Debounce: same barcode within 500ms
      if (barcode === lastScannedRef.current && now - lastScannedTimeRef.current < 500) {
        return;
      }

      lastScannedRef.current = barcode;
      lastScannedTimeRef.current = now;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onScan(barcode);
    }, [onScan]),
  });

  if (!device) {
    return (
      <View style={styles.noCamera}>
        <Text style={styles.noCameraText}>No camera available</Text>
        <Text style={styles.noCameraHint}>Use a Bluetooth barcode scanner instead</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        device={device}
        isActive={true}
        codeScanner={codeScanner}
        style={StyleSheet.absoluteFill}
      />
      {/* Targeting overlay */}
      <View style={styles.overlay}>
        <View style={styles.targetBox} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 250,
    position: 'relative',
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    margin: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetBox: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: '#FFFFFF80',
    borderRadius: 12,
  },
  noCamera: {
    flex: 1,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    margin: 8,
  },
  noCameraText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  noCameraHint: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
});
