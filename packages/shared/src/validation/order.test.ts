import { describe, it, expect } from 'vitest';
import { createOrderSchema, orderLineSchema, syncUploadPayloadSchema } from './order';

const validLine = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  product_id: '550e8400-e29b-41d4-a716-446655440001',
  variant_id: null,
  product_name: 'A-Journal Classic',
  product_sku: 'AJ-001',
  quantity: 2,
  unit_price: 1495,
  discount_pct: 0,
  tax_rate: 2100,
  line_total: 2990,
};

const validOrder = {
  id: '550e8400-e29b-41d4-a716-446655440010',
  customer_id: '550e8400-e29b-41d4-a716-446655440020',
  event_id: null,
  lines: [validLine],
  notes: null,
  payment_method: 'invoice' as const,
  payment_terms: 'net_30' as const,
  currency: 'EUR',
};

describe('orderLineSchema', () => {
  it('validates a correct order line', () => {
    const result = orderLineSchema.safeParse(validLine);
    expect(result.success).toBe(true);
  });

  it('rejects missing product_name', () => {
    const result = orderLineSchema.safeParse({ ...validLine, product_name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects negative quantity', () => {
    const result = orderLineSchema.safeParse({ ...validLine, quantity: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects zero quantity', () => {
    const result = orderLineSchema.safeParse({ ...validLine, quantity: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects negative unit_price', () => {
    const result = orderLineSchema.safeParse({ ...validLine, unit_price: -100 });
    expect(result.success).toBe(false);
  });

  it('allows zero unit_price (free item)', () => {
    const result = orderLineSchema.safeParse({ ...validLine, unit_price: 0 });
    expect(result.success).toBe(true);
  });

  it('rejects discount_pct over 100', () => {
    const result = orderLineSchema.safeParse({ ...validLine, discount_pct: 101 });
    expect(result.success).toBe(false);
  });

  it('defaults discount_pct to 0', () => {
    const { discount_pct: _, ...withoutDiscount } = validLine;
    const result = orderLineSchema.safeParse(withoutDiscount);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.discount_pct).toBe(0);
    }
  });

  it('defaults tax_rate to 2100', () => {
    const { tax_rate: _, ...withoutTax } = validLine;
    const result = orderLineSchema.safeParse(withoutTax);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tax_rate).toBe(2100);
    }
  });

  it('rejects non-uuid id', () => {
    const result = orderLineSchema.safeParse({ ...validLine, id: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });
});

describe('createOrderSchema', () => {
  it('validates a correct order', () => {
    const result = createOrderSchema.safeParse(validOrder);
    expect(result.success).toBe(true);
  });

  it('rejects empty lines array', () => {
    const result = createOrderSchema.safeParse({ ...validOrder, lines: [] });
    expect(result.success).toBe(false);
  });

  it('allows null customer_id (quick sale)', () => {
    const result = createOrderSchema.safeParse({ ...validOrder, customer_id: null });
    expect(result.success).toBe(true);
  });

  it('defaults currency to EUR', () => {
    const { currency: _, ...withoutCurrency } = validOrder;
    const result = createOrderSchema.safeParse(withoutCurrency);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe('EUR');
    }
  });

  it('defaults payment_terms to net_30', () => {
    const { payment_terms: _, ...withoutTerms } = validOrder;
    const result = createOrderSchema.safeParse(withoutTerms);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.payment_terms).toBe('net_30');
    }
  });

  it('validates all payment methods', () => {
    for (const method of ['invoice', 'cash', 'card', 'ideal', 'other'] as const) {
      const result = createOrderSchema.safeParse({ ...validOrder, payment_method: method });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid payment method', () => {
    const result = createOrderSchema.safeParse({ ...validOrder, payment_method: 'bitcoin' });
    expect(result.success).toBe(false);
  });

  it('includes session_id field', () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      session_id: '550e8400-e29b-41d4-a716-446655440099',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.session_id).toBe('550e8400-e29b-41d4-a716-446655440099');
    }
  });

  it('includes device_id field', () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      device_id: 'ipad-001',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.device_id).toBe('ipad-001');
    }
  });

  it('defaults session_id and device_id to null', () => {
    const result = createOrderSchema.safeParse(validOrder);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.session_id).toBeNull();
      expect(result.data.device_id).toBeNull();
    }
  });
});

describe('syncUploadPayloadSchema', () => {
  it('validates a correct payload', () => {
    const result = syncUploadPayloadSchema.safeParse({
      transactions: [
        {
          ops: [
            { op: 'PUT', table: 'orders', id: 'abc', data: {} },
          ],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty transactions array', () => {
    const result = syncUploadPayloadSchema.safeParse({ transactions: [] });
    expect(result.success).toBe(false);
  });

  it('rejects missing transactions', () => {
    const result = syncUploadPayloadSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects more than 100 ops per transaction', () => {
    const ops = Array.from({ length: 101 }, (_, i) => ({
      op: 'PUT' as const,
      table: 'orders',
      id: `id-${i}`,
      data: {},
    }));
    const result = syncUploadPayloadSchema.safeParse({
      transactions: [{ ops }],
    });
    expect(result.success).toBe(false);
  });

  it('allows exactly 100 ops per transaction', () => {
    const ops = Array.from({ length: 100 }, (_, i) => ({
      op: 'PUT' as const,
      table: 'orders',
      id: `id-${i}`,
      data: {},
    }));
    const result = syncUploadPayloadSchema.safeParse({
      transactions: [{ ops }],
    });
    expect(result.success).toBe(true);
  });

  it('validates op types', () => {
    for (const op of ['PUT', 'PATCH', 'DELETE'] as const) {
      const result = syncUploadPayloadSchema.safeParse({
        transactions: [{ ops: [{ op, table: 'orders', id: 'x', data: {} }] }],
      });
      expect(result.success).toBe(true);
    }
  });

  it('defaults op to PUT', () => {
    const result = syncUploadPayloadSchema.safeParse({
      transactions: [{ ops: [{ table: 'orders', id: 'x' }] }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.transactions[0]!.ops[0]!.op).toBe('PUT');
    }
  });
});
