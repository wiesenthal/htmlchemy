import { relations } from "drizzle-orm";
import { agents, childToParent, conversations, messages } from "./schema";

export const agentsRelations = relations(agents, ({ many }) => ({
  children: many(childToParent, { relationName: "parentToChild" }),
  parents: many(childToParent, { relationName: "childToParent" }),
  conversationsAsAgent1: many(conversations, {
    relationName: "agent1Conversations",
  }),
  conversationsAsAgent2: many(conversations, {
    relationName: "agent2Conversations",
  }),
  messages: many(messages),
}));

export const childToParentRelations = relations(childToParent, ({ one }) => ({
  child: one(agents, {
    fields: [childToParent.childId],
    references: [agents.id],
    relationName: "childToParent",
  }),
  parent: one(agents, {
    fields: [childToParent.parentId],
    references: [agents.id],
    relationName: "parentToChild",
  }),
}));

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    agent1: one(agents, {
      fields: [conversations.agent1],
      references: [agents.id],
      relationName: "agent1Conversations",
    }),
    agent2: one(agents, {
      fields: [conversations.agent2],
      references: [agents.id],
      relationName: "agent2Conversations",
    }),
    messages: many(messages),
  }),
);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  agent: one(agents, {
    fields: [messages.agentId],
    references: [agents.id],
  }),
}));
