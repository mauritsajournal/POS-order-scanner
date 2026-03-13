import { create } from 'zustand';
import { calculateOrderTotals, lineTotal } from '@scanorder/shared';
import type { Product, ProductVariant, Customer } from '@scanorder/shared';
import * as Crypto from 'expo-crypto';

export interface CartLine {
  id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  unitPrice: number; // cents
  discountPct: number;
  taxRate: number; // basis points
  notes: string | null;
}

interface CartState {
  lines: CartLine[];
  customer: Customer | null;
  notes: string | null;

  // Actions
  addItem: (product: Product, variant?: ProductVariant) => number; // returns new quantity
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  setLineDiscount: (lineId: string, discountPct: number) => void;
  setLineNotes: (lineId: string, notes: string | null) => void;
  setCustomer: (customer: Customer | null) => void;
  setNotes: (notes: string | null) => void;
  clearCart: () => void;

  // Computed
  subtotal: () => number;
  taxAmount: () => number;
  total: () => number;
  itemCount: () => number;
}

export const useCart = create<CartState>((set, get) => ({
  lines: [],
  customer: null,
  notes: null,

  addItem: (product, variant) => {
    const state = get();
    const matchKey = variant ? `${product.id}:${variant.id}` : product.id;
    const existing = state.lines.find((l) =>
      variant ? `${l.product.id}:${l.variant?.id}` === matchKey : l.product.id === matchKey && !l.variant,
    );

    if (existing) {
      const newQty = existing.quantity + 1;
      set({
        lines: state.lines.map((l) =>
          l.id === existing.id ? { ...l, quantity: newQty } : l,
        ),
      });
      return newQty;
    }

    const price = variant?.price_override ?? product.base_price;
    const newLine: CartLine = {
      id: Crypto.randomUUID(),
      product,
      variant,
      quantity: 1,
      unitPrice: price,
      discountPct: 0,
      taxRate: product.tax_rate,
      notes: null,
    };

    set({ lines: [...state.lines, newLine] });
    return 1;
  },

  removeItem: (lineId) => {
    set({ lines: get().lines.filter((l) => l.id !== lineId) });
  },

  updateQuantity: (lineId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(lineId);
      return;
    }
    set({
      lines: get().lines.map((l) => (l.id === lineId ? { ...l, quantity } : l)),
    });
  },

  setLineDiscount: (lineId, discountPct) => {
    const clamped = Math.max(0, Math.min(100, discountPct));
    set({
      lines: get().lines.map((l) =>
        l.id === lineId ? { ...l, discountPct: clamped } : l,
      ),
    });
  },

  setLineNotes: (lineId, notes) => {
    set({
      lines: get().lines.map((l) =>
        l.id === lineId ? { ...l, notes } : l,
      ),
    });
  },

  setCustomer: (customer) => set({ customer }),
  setNotes: (notes) => set({ notes }),
  clearCart: () => set({ lines: [], customer: null, notes: null }),

  subtotal: () => {
    return get().lines.reduce(
      (sum, l) => sum + lineTotal(l.unitPrice, l.quantity, l.discountPct),
      0,
    );
  },

  taxAmount: () => {
    const totals = calculateOrderTotals(
      get().lines.map((l) => ({
        unit_price: l.unitPrice,
        quantity: l.quantity,
        discount_pct: l.discountPct,
        tax_rate: l.taxRate,
      })),
    );
    return totals.taxAmount;
  },

  total: () => {
    const totals = calculateOrderTotals(
      get().lines.map((l) => ({
        unit_price: l.unitPrice,
        quantity: l.quantity,
        discount_pct: l.discountPct,
        tax_rate: l.taxRate,
      })),
    );
    return totals.total;
  },

  itemCount: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
}));
