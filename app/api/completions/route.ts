import Anthropic from "@anthropic-ai/sdk";
import Handlebars from "handlebars";
import { NextRequest, NextResponse } from "next/server";
import { Ragie } from "ragie";
import { z } from "zod";

const ragie = new Ragie({ auth: process.env.RAGIE_API_KEY });
const anthropic = new Anthropic();

const payloadSchema = z.object({
  message: z.string(),
  partition: z.string(),
  topK: z.number(),
  rerank: z.boolean(),
  systemPrompt: z.string(),
});

export async function POST(request: NextRequest) {
  const json = await request.json();
  const payload = payloadSchema.parse(json);

  const ragieResponse = await ragie.retrievals.retrieve({
    query: payload.message,
    partition: payload.partition,
    topK: payload.topK,
    rerank: payload.rerank,
  });

  const compiled = Handlebars.compile(payload.systemPrompt);

  const systemPrompt = compiled({
    now: new Date().toISOString(),
  });

  const anthropicResponse = await anthropic.messages.create({
    model: "claude-3-7-sonnet-latest",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: systemPrompt,
      },
      {
        role: "user",
        content: ragieResponse.scoredChunks.map((chunk) => ({
          type: "document",
          source: {
            type: "text",
            media_type: "text/plain",
            data: chunk.text,
          },
          title: chunk.documentName,
          citations: { enabled: true },
        })),
      },
      {
        role: "user",
        content: payload.message,
      },
    ],
  });

  return NextResponse.json({
    modelResponse: anthropicResponse,
    retrievalResponse: ragieResponse,
  });
}
