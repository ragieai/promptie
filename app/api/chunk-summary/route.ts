import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { text } = await request.json();
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20240620",
    messages: [
      { role: "user", content: "Summarize the following text:\n\n" + text },
    ],
    max_tokens: 1000,
  });

  return NextResponse.json({
    summary:
      response.content[0].type === "text" ? response.content[0].text : "",
  });
}
