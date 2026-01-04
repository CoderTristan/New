import { pgTable, text, integer, boolean, timestamp, serial, json } from 'drizzle-orm/pg-core';

// ------------------------
// Idea Table
// ------------------------
export const Ideas = pgTable('ideas', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull(), // store user reference
  title: text('title').notNull(),
  description: text('description').notNull(),
  topic: text('topic').notNull(), // enum enforced in app
  format: text('format').notNull(),
  hook_type: text('hook_type').notNull(),
  priority: text('priority').notNull(),
  status: text('status').default('captured').notNull(),
  promoted_to_script_id: integer('promoted_to_script_id'), // optional FK to scripts.id
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// ------------------------
// Script Table
// ------------------------
export const Scripts = pgTable('scripts', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull(),
  title: text('title').notNull(),
  idea_id: integer('idea_id').references(() => Ideas.id),
  stage: text('stage').default('idea').notNull(),
  topic: text('topic'),
  format: text('format'),
  hook_type: text('hook_type'),
  target_length_minutes: integer('target_length_minutes'),
  words_per_minute: integer('words_per_minute').default(150),
  hook_content: text('hook_content'),
  outline_content: text('outline_content'),
  script_content: text('script_content'),
  notes_content: text('notes_content'),
  checklist_intro: boolean('checklist_intro').default(false),
  checklist_body: boolean('checklist_body').default(false),
  checklist_cta: boolean('checklist_cta').default(false),
  attachments: json('attachments'), // array of objects
  versions: json('versions'),       // array of objects
  scheduled_date: timestamp('scheduled_date'),
  published_date: timestamp('published_date'),
  last_edited: timestamp('last_edited'),
  stalled_since: timestamp('stalled_since'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// ------------------------
// Review Table
// ------------------------
export const Reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull(),
  script_id: integer('script_id').references(() => Scripts.id).notNull(),
  views: integer('views').notNull(),
  retention_percentage: integer('retention_percentage').notNull(),
  revenue: integer('revenue'),
  what_worked: text('what_worked').notNull(),
  what_didnt_work: text('what_didnt_work').notNull(),
  changes_for_next_time: text('changes_for_next_time').notNull(),
  is_above_average: boolean('is_above_average'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// ------------------------
// UserSettings Table
// ------------------------
export const UserSettings = pgTable('user_settings', {
  user_id: text('user_id').primaryKey().notNull(),
  default_words_per_minute: integer('default_words_per_minute').default(150),
  max_concurrent_drafts: integer('max_concurrent_drafts').default(5),
  require_schedule_before_draft: boolean('require_schedule_before_draft').default(false),
  channel_baseline_views: integer('channel_baseline_views'),
  channel_baseline_retention: integer('channel_baseline_retention'),
  has_pending_review: boolean('has_pending_review').default(false),
  pending_review_script_id: integer('pending_review_script_id'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});



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
