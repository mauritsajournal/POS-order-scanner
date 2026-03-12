import { useState, useCallback } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface SearchBarProps {
  placeholder?: string;
  context?: 'products' | 'customers';
  onSearch?: (query: string) => void;
}

export function SearchBar({ placeholder = 'Search...', onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleChange = useCallback(
    (text: string) => {
      setQuery(text);
      // Debounce would go here in production
      onSearch?.(text);
    },
    [onSearch],
  );

  return (
    <View style={styles.container}>
      <TextInput
        value={query}
        onChangeText={handleChange}
        placeholder={placeholder}
        style={styles.input}
        placeholderTextColor="#9CA3AF"
        clearButtonMode="while-editing"
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 8, paddingVertical: 4 },
  input: {
    backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 12,
    paddingVertical: 10, fontSize: 15, color: '#111827',
  },
});
