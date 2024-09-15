import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { schema } from "./schema";
import { type NextRequest } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { prompt } = (await req.json()) as { prompt: string };

  const result = await streamObject({
    model: openai("gpt-4o-mini"),
    schema: schema,
    prompt: prompt,
  });

  return result.toTextStreamResponse();
}
