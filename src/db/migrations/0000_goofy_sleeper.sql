CREATE TYPE "public"."vote_action" AS ENUM('daily_study', 'deep_engagement', 'return_after_break', 'explore_new_topic', 'review_old_material', 'complete_deck', 'consistent_week');--> statement-breakpoint
CREATE TABLE "identity_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"archetype_id" varchar(64) NOT NULL,
	"action" "vote_action" NOT NULL,
	"strength" numeric(3, 2) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"deck_id" integer NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"cards_studied" integer DEFAULT 0 NOT NULL,
	"flipped_cards" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_archetypes" (
	"user_id" uuid NOT NULL,
	"archetype_id" varchar(64) NOT NULL,
	"is_primary" boolean DEFAULT true NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"current_stage" smallint DEFAULT 0 NOT NULL,
	"total_votes" integer DEFAULT 0 NOT NULL,
	"quality_avg" numeric(4, 3) DEFAULT '0' NOT NULL,
	"active_days" integer DEFAULT 0 NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "user_archetypes_user_id_archetype_id_pk" PRIMARY KEY("user_id","archetype_id")
);
--> statement-breakpoint
CREATE INDEX "identity_votes_user_archetype_created_idx" ON "identity_votes" USING btree ("user_id","archetype_id","created_at");