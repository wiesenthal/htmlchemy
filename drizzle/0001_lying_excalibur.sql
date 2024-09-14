CREATE TABLE IF NOT EXISTS "persuagents_agent" (
	"id" serial PRIMARY KEY NOT NULL,
	"prompt" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "persuagents_child_to_parent" (
	"id" serial PRIMARY KEY NOT NULL,
	"child_id" integer NOT NULL,
	"parent_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "persuagents_conversation" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent1" integer NOT NULL,
	"agent2" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "persuagents_message" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"agent_id" integer NOT NULL,
	"content" text NOT NULL,
	"idx" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "persuagents_child_to_parent" ADD CONSTRAINT "persuagents_child_to_parent_child_id_persuagents_agent_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."persuagents_agent"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "persuagents_child_to_parent" ADD CONSTRAINT "persuagents_child_to_parent_parent_id_persuagents_agent_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."persuagents_agent"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "persuagents_conversation" ADD CONSTRAINT "persuagents_conversation_agent1_persuagents_agent_id_fk" FOREIGN KEY ("agent1") REFERENCES "public"."persuagents_agent"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "persuagents_conversation" ADD CONSTRAINT "persuagents_conversation_agent2_persuagents_agent_id_fk" FOREIGN KEY ("agent2") REFERENCES "public"."persuagents_agent"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "persuagents_message" ADD CONSTRAINT "persuagents_message_conversation_id_persuagents_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."persuagents_conversation"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "persuagents_message" ADD CONSTRAINT "persuagents_message_agent_id_persuagents_agent_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."persuagents_agent"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conversation_idx" ON "persuagents_message" USING btree ("conversation_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_conversation_idx" ON "persuagents_message" USING btree ("conversation_id","idx");