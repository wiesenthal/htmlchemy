import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { schema } from "./schema";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = await streamObject({
    model: openai("gpt-4o-mini"),
    schema: schema,
    prompt: prompt as string,
  });

  return result.toTextStreamResponse();
}
