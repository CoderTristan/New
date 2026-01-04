CREATE TABLE "ideas" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"topic" text NOT NULL,
	"format" text NOT NULL,
	"hook_type" text NOT NULL,
	"priority" text NOT NULL,
	"status" text DEFAULT 'captured' NOT NULL,
	"promoted_to_script_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"script_id" integer NOT NULL,
	"views" integer NOT NULL,
	"retention_percentage" integer NOT NULL,
	"revenue" integer,
	"what_worked" text NOT NULL,
	"what_didnt_work" text NOT NULL,
	"changes_for_next_time" text NOT NULL,
	"is_above_average" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scripts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"idea_id" integer,
	"stage" text DEFAULT 'idea' NOT NULL,
	"topic" text,
	"format" text,
	"hook_type" text,
	"target_length_minutes" integer,
	"words_per_minute" integer DEFAULT 150,
	"hook_content" text,
	"outline_content" text,
	"script_content" text,
	"notes_content" text,
	"checklist_intro" boolean DEFAULT false,
	"checklist_body" boolean DEFAULT false,
	"checklist_cta" boolean DEFAULT false,
	"attachments" json,
	"versions" json,
	"scheduled_date" timestamp,
	"published_date" timestamp,
	"last_edited" timestamp,
	"stalled_since" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"user_id" text PRIMARY KEY NOT NULL,
	"tier" text DEFAULT 'free' NOT NULL,
	"default_words_per_minute" integer DEFAULT 150,
	"max_concurrent_drafts" integer DEFAULT 5,
	"require_schedule_before_draft" boolean DEFAULT false,
	"channel_baseline_views" integer,
	"channel_baseline_retention" integer,
	"has_pending_review" boolean DEFAULT false,
	"pending_review_script_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_script_id_scripts_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."scripts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scripts" ADD CONSTRAINT "scripts_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE no action ON UPDATE no action;