import { useRef, useCallback } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

interface HardwareScannerInputProps {
  onScan: (barcode: string) => void;
  minLength?: number;
}

export function HardwareScannerInput({ onScan, minLength = 8 }: HardwareScannerInputProps) {
  const inputRef = useRef<TextInput>(null);
  const lastScanTime = useRef(0);

  const handleSubmit = useCallback(
    ({ nativeEvent: { text } }: { nativeEvent: { text: string } }) => {
      const trimmed = text.trim();
      const now = Date.now();

      if (trimmed.length >= minLength && now - lastScanTime.current > 500) {
        lastScanTime.current = now;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onScan(trimmed);
      }

      inputRef.current?.clear();
    },
    [onScan, minLength],
  );

  return (
    <TextInput
      ref={inputRef}
      style={styles.hiddenInput}
      autoFocus
      showSoftInputOnFocus={false}
      onSubmitEditing={handleSubmit}
      blurOnSubmit={false}
      caretHidden
    />
  );
}

const styles = StyleSheet.create({
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});
