import { pgTable, uuid, text, boolean, jsonb, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const integrationTypeEnum = pgEnum('integration_type', [
  'woocommerce',
  'exact_online',
  'mollie',
  'stripe',
  'shopify',
]);

export const integrations = pgTable('integrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id),
  type: integrationTypeEnum('type').notNull(),
  is_active: boolean('is_active').notNull().default(true),
  credentials: jsonb('credentials').notNull(), // encrypted at rest
  settings: jsonb('settings').default({}),
  last_sync_at: timestamp('last_sync_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const integrationMappings = pgTable('integration_mappings', {
  id: uuid('id').primaryKey().defaultRandom(),
  integration_id: uuid('integration_id').notNull().references(() => integrations.id),
  local_table: text('local_table').notNull(), // 'products', 'orders', 'customers'
  local_id: uuid('local_id').notNull(),
  external_id: text('external_id').notNull(),
  external_data: jsonb('external_data').default({}),
  synced_at: timestamp('synced_at', { withTimezone: true }).defaultNow().notNull(),
});
