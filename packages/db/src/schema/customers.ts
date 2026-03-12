import { pgTable, uuid, text, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id),
  company_name: text('company_name').notNull(),
  contact_name: text('contact_name'),
  email: text('email'),
  phone: text('phone'),
  vat_number: text('vat_number'),
  price_group: text('price_group'),
  address: jsonb('address'),
  notes: text('notes'),
  is_deleted: boolean('is_deleted').notNull().default(false),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
