import { pgTable, uuid, text, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const eventStatusEnum = pgEnum('event_status', [
  'upcoming',
  'active',
  'completed',
  'cancelled',
]);

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  location: text('location'),
  start_date: timestamp('start_date', { withTimezone: true }).notNull(),
  end_date: timestamp('end_date', { withTimezone: true }).notNull(),
  status: eventStatusEnum('status').notNull().default('upcoming'),
  notes: text('notes'),
  is_deleted: boolean('is_deleted').notNull().default(false),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
