import { View, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

interface SplitPaneProps {
  left: ReactNode;
  right: ReactNode;
  ratio?: number; // 0-1, left pane width ratio (default 0.5)
}

export function SplitPane({ left, right, ratio = 0.5 }: SplitPaneProps) {
  const leftStyle: ViewStyle = { flex: ratio, borderRightWidth: 1, borderRightColor: '#E5E7EB' };
  const rightStyle: ViewStyle = { flex: 1 - ratio };

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <View style={leftStyle}>{left}</View>
      <View style={rightStyle}>{right}</View>
    </View>
  );
}
