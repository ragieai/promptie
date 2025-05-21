import { getRagieClient } from "@/lib/server/utils";
import {
  LLM_PROVIDER,
  OPENROUTER_API_KEY,
  OPENROUTER_MODEL,
} from "@/lib/server/settings";
import Anthropic from "@anthropic-ai/sdk";
import Handlebars from "handlebars";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createOpenAI, generateText } from "ai/core";

const ragie = getRagieClient();
const anthropic = new Anthropic();

let openrouter: ReturnType<typeof createOpenAI> | undefined;
if (LLM_PROVIDER === "openrouter") {
  if (!OPENROUTER_API_KEY || !OPENROUTER_MODEL) {
    throw new Error(
      "OpenRouter API key or model not set for LLM_PROVIDER 'openrouter'"
    );
  }
  openrouter = createOpenAI({
    apiKey: OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
  });
}

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

  const systemPromptContent = compiled({
    now: new Date().toISOString(),
  });

  let modelResponse;

  if (LLM_PROVIDER === "openrouter" && openrouter) {
    const documentContext = ragieResponse.scoredChunks
      .map((chunk) => `Document: ${chunk.documentName}\n${chunk.text}`)
      .join("\n\n");

    const messages = [
      { role: "system", content: systemPromptContent },
      {
        role: "user",
        content: `${documentContext}\n\nUser Query: ${payload.message}`,
      },
    ];

    try {
      const { text } = await generateText({
        model: openrouter(OPENROUTER_MODEL!),
        messages: messages,
        maxTokens: 1000,
      });
      // Adapt the OpenRouter response to a structure similar to Anthropic's
      // This is a simplified adaptation. You might need to adjust based on actual OpenRouter response
      // and how your frontend consumes it.
      modelResponse = {
        id: `openrouter-${Date.now()}`, // Placeholder ID
        type: "message",
        role: "assistant",
        model: OPENROUTER_MODEL,
        content: [{ type: "text", text: text }],
        usage: { input_tokens: 0, output_tokens: 0 }, // Placeholder usage
      };
    } catch (error) {
      console.error("OpenRouter API error:", error);
      return NextResponse.json(
        { error: "Failed to fetch from OpenRouter" },
        { status: 500 }
      );
    }
  } else {
    // Default to Anthropic
    const anthropicResponse = await anthropic.messages.create({
      model: "claude-3-opus-20240229", // Assuming you want to keep a specific model or make it configurable
      max_tokens: 1000,
      messages: [
        {
          role: "user", // Anthropic typically starts with a user role for system-like prompts
          content: systemPromptContent,
        },
        {
          role: "user", // Or assistant, depending on how you structure conversation for Anthropic
          content: ragieResponse.scoredChunks.map((chunk) => ({
            type: "document" as const, // Ensure type is correctly inferred
            source: {
              type: "text" as const,
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
    modelResponse = anthropicResponse;
  }

  return NextResponse.json({
    modelResponse: modelResponse,
    retrievalResponse: ragieResponse,
  });
}
