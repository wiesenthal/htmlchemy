// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `persuagents_${name}`);

export const posts = createTable(
  "post",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.name),
  }),
);

export const agents = createTable("agent", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const childToParent = createTable("child_to_parent", {
  id: serial("id").primaryKey(),
  childId: integer("child_id")
    .references(() => agents.id)
    .notNull(),
  parentId: integer("parent_id")
    .references(() => agents.id)
    .notNull(),
});

export const conversations = createTable("conversation", {
  id: serial("id").primaryKey(),
  agent1: integer("agent1")
    .references(() => agents.id)
    .notNull(),
  agent2: integer("agent2")
    .references(() => agents.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const messages = createTable(
  "message",
  {
    id: serial("id").primaryKey(),
    conversationId: integer("conversation_id")
      .references(() => conversations.id)
      .notNull(),
    agentId: integer("agent_id")
      .references(() => agents.id)
      .notNull(),
    content: text("content").notNull(),
    idx: integer("idx").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    conversationIdx: index("conversation_idx").on(table.conversationId),
    uniqueConversationIdx: uniqueIndex("unique_conversation_idx").on(
      table.conversationId,
      table.idx,
    ),
  }),
);
