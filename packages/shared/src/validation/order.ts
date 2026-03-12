import { z } from 'zod';

export const orderLineSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().nullable(),
  product_name: z.string().min(1),
  product_sku: z.string().min(1),
  quantity: z.number().int().positive(),
  unit_price: z.number().int().nonnegative(), // cents
  discount_pct: z.number().min(0).max(100).default(0),
  tax_rate: z.number().int().nonnegative().default(2100), // basis points
  line_total: z.number().int().nonnegative(), // cents
  notes: z.string().nullable().default(null),
});

export const createOrderSchema = z.object({
  id: z.string().uuid(),
  customer_id: z.string().uuid().nullable(), // null = quick sale
  event_id: z.string().uuid().nullable(),
  lines: z.array(orderLineSchema).min(1, 'Order must have at least one item'),
  notes: z.string().nullable().default(null),
  payment_method: z
    .enum(['invoice', 'cash', 'card', 'ideal', 'other'])
    .nullable()
    .default(null),
  payment_terms: z
    .enum(['immediate', 'net_14', 'net_30', 'net_60'])
    .nullable()
    .default('net_30'),
  currency: z.string().length(3).default('EUR'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderLineInput = z.infer<typeof orderLineSchema>;
