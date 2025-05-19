import { getRagieClient } from "@/lib/server/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ragie = getRagieClient();
  const summary = await ragie.documents.getSummary({ documentId: id });
  return NextResponse.json(summary);
}
