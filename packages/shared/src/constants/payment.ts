import type { PaymentMethod, PaymentTerms } from '../types';

export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  'invoice',
  'cash',
  'card',
  'ideal',
  'other',
] as const;

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  invoice: 'Invoice',
  cash: 'Cash',
  card: 'Card',
  ideal: 'iDEAL',
  other: 'Other',
};

export const PAYMENT_TERMS: readonly PaymentTerms[] = [
  'immediate',
  'net_14',
  'net_30',
  'net_60',
] as const;

export const PAYMENT_TERMS_LABELS: Record<PaymentTerms, string> = {
  immediate: 'Immediate',
  net_14: 'Net 14 days',
  net_30: 'Net 30 days',
  net_60: 'Net 60 days',
};
