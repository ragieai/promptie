import { getRagieClient } from "@/lib/server/utils";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ragie = getRagieClient();

const payloadSchema = z.object({
  message: z.string(),
  partition: z.string(),
  topK: z.number(),
  rerank: z.boolean(),
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

  return NextResponse.json({
    retrievalResponse: ragieResponse,
  });
}
