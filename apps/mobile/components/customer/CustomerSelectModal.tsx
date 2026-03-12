import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import type { Customer } from '@scanorder/shared';

interface CustomerSelectModalProps {
  visible: boolean;
  onSelect: (customer: Customer) => void;
  onClose: () => void;
  customers: Customer[];
}

export function CustomerSelectModal({
  visible,
  onSelect,
  onClose,
  customers,
}: CustomerSelectModalProps) {
  const [search, setSearch] = useState('');

  const filtered = search.length < 2
    ? customers
    : customers.filter((c) => {
        const q = search.toLowerCase();
        return (
          c.company_name.toLowerCase().includes(q) ||
          (c.contact_name?.toLowerCase().includes(q) ?? false) ||
          (c.email?.toLowerCase().includes(q) ?? false) ||
          (c.city?.toLowerCase().includes(q) ?? false)
        );
      });

  const handleSelect = useCallback(
    (customer: Customer) => {
      onSelect(customer);
      setSearch('');
    },
    [onSelect],
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Customer</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by company, contact, email, city..."
          style={styles.searchInput}
          placeholderTextColor="#9CA3AF"
          autoFocus
          clearButtonMode="while-editing"
        />

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => handleSelect(item)}>
              <Text style={styles.company}>{item.company_name}</Text>
              {item.contact_name && (
                <Text style={styles.contact}>{item.contact_name}</Text>
              )}
              <Text style={styles.meta}>
                {[item.city, item.country].filter(Boolean).join(', ')}
                {item.email ? ` · ${item.email}` : ''}
              </Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {search.length > 0 ? 'No customers found' : 'No customers loaded'}
            </Text>
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  closeButton: { fontSize: 16, color: '#2563EB', fontWeight: '600' },
  searchInput: {
    margin: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
  },
  row: { paddingHorizontal: 16, paddingVertical: 12 },
  company: { fontSize: 16, fontWeight: '600', color: '#111827' },
  contact: { fontSize: 14, color: '#374151', marginTop: 2 },
  meta: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  separator: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 16 },
  empty: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 15,
    marginTop: 48,
  },
});
