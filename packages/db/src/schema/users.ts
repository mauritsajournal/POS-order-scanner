import { pgTable, uuid, text, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const userRoleEnum = pgEnum('user_role', ['admin', 'manager', 'sales_rep']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id),
  email: text('email').notNull(),
  full_name: text('full_name').notNull(),
  role: userRoleEnum('role').notNull().default('sales_rep'),
  auth_id: uuid('auth_id').notNull().unique(), // Supabase Auth UID
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
