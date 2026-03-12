import type { OrderStatus } from '../types';

export const ORDER_STATUSES: readonly OrderStatus[] = [
  'draft',
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'completed',
  'cancelled',
] as const;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Draft',
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  draft: '#6B7280',      // gray
  pending: '#F59E0B',    // amber
  confirmed: '#10B981',  // green
  processing: '#3B82F6', // blue
  shipped: '#8B5CF6',    // purple
  completed: '#059669',  // emerald
  cancelled: '#EF4444',  // red
};
