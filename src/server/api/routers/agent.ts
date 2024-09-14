import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { agents } from "~/server/db/schema";

export const agentRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ prompt: z.string().min(1) }))
    .mutation(
      async ({ ctx, input }) => await ctx.db.insert(agents).values(input),
    ),
  getAll: publicProcedure.query(async ({ ctx }) =>
    ctx.db.query.agents.findMany(),
  ),
  delete: publicProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) =>
      ctx.db.delete(agents).where(eq(agents.id, input)),
    ),
});
