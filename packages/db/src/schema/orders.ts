import { pgTable, uuid, text, integer, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { users } from './users';
import { customers } from './customers';
import { events } from './events';
import { products } from './products';
import { productVariants } from './products';

export const orderStatusEnum = pgEnum('order_status', [
  'draft',
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'completed',
  'cancelled',
]);

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey(), // generated on device (offline!)
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id),
  order_number: text('order_number'), // human-readable, assigned by server
  customer_id: uuid('customer_id').references(() => customers.id), // null = quick sale
  event_id: uuid('event_id').references(() => events.id),
  user_id: uuid('user_id').notNull().references(() => users.id),
  status: orderStatusEnum('status').notNull().default('draft'),
  subtotal: integer('subtotal').notNull().default(0), // cents
  discount_amount: integer('discount_amount').notNull().default(0),
  tax_amount: integer('tax_amount').notNull().default(0),
  total: integer('total').notNull().default(0),
  currency: text('currency').notNull().default('EUR'),
  notes: text('notes'),
  payment_method: text('payment_method'), // 'invoice', 'cash', 'card', 'ideal'
  payment_terms: text('payment_terms'), // 'net_30', 'net_60', 'immediate'
  device_id: text('device_id'),
  created_offline: boolean('created_offline').notNull().default(false),
  synced_at: timestamp('synced_at', { withTimezone: true }),
  is_deleted: boolean('is_deleted').notNull().default(false),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const orderLines = pgTable('order_lines', {
  id: uuid('id').primaryKey().defaultRandom(),
  order_id: uuid('order_id').notNull().references(() => orders.id),
  product_id: uuid('product_id').notNull().references(() => products.id),
  variant_id: uuid('variant_id').references(() => productVariants.id),
  product_name: text('product_name').notNull(), // denormalized
  product_sku: text('product_sku').notNull(), // denormalized
  quantity: integer('quantity').notNull(),
  unit_price: integer('unit_price').notNull(), // cents
  discount_pct: integer('discount_pct').notNull().default(0),
  tax_rate: integer('tax_rate').notNull().default(2100), // basis points
  line_total: integer('line_total').notNull(), // cents
  notes: text('notes'),
});
