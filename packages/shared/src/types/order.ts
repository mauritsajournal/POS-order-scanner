export type OrderStatus =
  | 'draft'
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled';

export type PaymentMethod = 'invoice' | 'cash' | 'card' | 'ideal' | 'other';
export type PaymentTerms = 'immediate' | 'net_14' | 'net_30' | 'net_60';

export interface Order {
  id: string; // UUID generated on device
  tenant_id: string;
  order_number: string | null; // human-readable, assigned by server
  customer_id: string | null; // null = quick sale
  event_id: string | null;
  user_id: string;
  status: OrderStatus;
  subtotal: number; // cents
  discount_amount: number; // cents
  tax_amount: number; // cents
  total: number; // cents
  currency: string;
  notes: string | null;
  payment_method: PaymentMethod | null;
  payment_terms: PaymentTerms | null;
  session_id: string | null;
  device_id: string | null;
  created_offline: boolean;
  synced_at: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderLine {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string; // denormalized for offline display
  product_sku: string; // denormalized
  quantity: number;
  unit_price: number; // cents
  discount_pct: number; // percentage: 10 = 10%
  tax_rate: number; // basis points: 2100 = 21%
  line_total: number; // cents (quantity * unit_price * (1 - discount_pct/100))
  notes: string | null;
}
