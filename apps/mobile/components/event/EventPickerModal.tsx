import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { colors } from '@scanorder/shared';

/**
 * Event picker modal (MOB-A007).
 *
 * Shows a list of trade show events. User selects one to associate
 * all subsequent orders with that event. Selection persisted via MMKV.
 *
 * Events will come from PowerSync local DB when connected.
 */

interface Event {
  id: string;
  name: string;
  location: string | null;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
}

interface EventPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (event: Event) => void;
  selectedEventId: string | null;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  upcoming: { bg: '#EFF6FF', text: '#2563EB' },
  active: { bg: '#F0FDF4', text: '#16A34A' },
  completed: { bg: '#F3F4F6', text: '#6B7280' },
  cancelled: { bg: '#FEF2F2', text: '#DC2626' },
};

export function EventPickerModal({
  visible,
  onClose,
  onSelect,
  selectedEventId,
}: EventPickerModalProps) {
  // TODO: Replace with PowerSync local query
  const events: Event[] = [];

  const renderEvent = ({ item }: { item: Event }) => {
    const isSelected = item.id === selectedEventId;
    const statusColors = STATUS_COLORS[item.status] ?? STATUS_COLORS.upcoming;
    const startDate = new Date(item.start_date);
    const endDate = new Date(item.end_date);

    return (
      <TouchableOpacity
        style={[styles.eventCard, isSelected && styles.eventCardSelected]}
        onPress={() => onSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.eventHeader}>
          <Text style={[styles.eventName, isSelected && styles.eventNameSelected]}>
            {item.name}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {item.status}
            </Text>
          </View>
        </View>

        {item.location && (
          <Text style={styles.eventLocation}>{item.location}</Text>
        )}

        <Text style={styles.eventDates}>
          {startDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
          {' - '}
          {endDate.toLocaleDateString('nl-NL', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </Text>

        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Text style={styles.checkmark}>{'check'}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Select Event</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Done</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Orders will be associated with the selected event.
        </Text>

        {/* Event list */}
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No events available</Text>
              <Text style={styles.emptySubtitle}>
                Events will appear here once synced from the server.
                Create events in the web dashboard first.
              </Text>
            </View>
          }
        />

        {/* No event option */}
        <TouchableOpacity
          style={styles.noEventButton}
          onPress={() => {
            onSelect({ id: '', name: 'No Event', location: null, start_date: '', end_date: '', status: 'active' });
          }}
        >
          <Text style={styles.noEventText}>Continue without event</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  closeButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.brand[500],
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 10,
    position: 'relative',
  },
  eventCardSelected: {
    borderColor: colors.brand[500],
    backgroundColor: colors.brand[50],
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  eventNameSelected: {
    color: colors.brand[700],
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  eventLocation: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  eventDates: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  selectedIndicator: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  checkmark: {
    fontSize: 20,
    color: colors.brand[500],
  },
  noEventButton: {
    marginHorizontal: 20,
    marginBottom: 40,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  noEventText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
