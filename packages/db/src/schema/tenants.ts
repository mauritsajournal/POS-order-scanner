import { pgTable, uuid, text, jsonb, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';

export const planEnum = pgEnum('plan', ['starter', 'professional', 'business', 'event_pass']);

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  plan: planEnum('plan').notNull().default('starter'),
  settings: jsonb('settings').default({}),
  default_currency: text('default_currency').notNull().default('EUR'),
  default_tax_rate: integer('default_tax_rate').notNull().default(2100), // 21.00%
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
