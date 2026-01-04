import { pgTable, text, integer, boolean, timestamp, serial, json } from 'drizzle-orm/pg-core';


export const Subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),

  user_id: text('user_id').notNull(),

  plan_name: text('plan_name'),
  status: text('status'),

  stripe_subscription_id: text('stripe_subscription_id').unique(),
  stripe_price_id: text('stripe_price_id'),

  current_period_end: timestamp('current_period_end', { withTimezone: true }),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});


// ------------------------
// UserProfile Table
// ------------------------
export const UserProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),

  user_id: text('user_id').notNull().unique(),

  first_name: text('first_name'),
  last_name: text('last_name'),
  email: text('email'),

  stripe_customer_id: text('stripe_customer_id'),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});
