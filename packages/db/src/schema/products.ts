import { pgTable, uuid, text, integer, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id),
  sku: text('sku').notNull(),
  barcode: text('barcode'),
  name: text('name').notNull(),
  description: text('description'),
  base_price: integer('base_price').notNull(), // cents
  tax_rate: integer('tax_rate').notNull().default(2100), // basis points
  stock_qty: integer('stock_qty').notNull().default(0),
  image_url: text('image_url'),
  category: text('category'),
  attributes: jsonb('attributes').default({}),
  is_active: boolean('is_active').notNull().default(true),
  is_deleted: boolean('is_deleted').notNull().default(false),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const productVariants = pgTable('product_variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  product_id: uuid('product_id').notNull().references(() => products.id),
  sku: text('sku').notNull(),
  barcode: text('barcode'),
  name: text('name').notNull(), // e.g. "L / Red"
  price_override: integer('price_override'), // cents, null = use base_price
  stock_qty: integer('stock_qty').notNull().default(0),
  attributes: jsonb('attributes').default({}),
  is_deleted: boolean('is_deleted').notNull().default(false),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
