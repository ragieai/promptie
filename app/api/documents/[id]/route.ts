import { NextRequest, NextResponse } from "next/server";
import { Ragie } from "ragie";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ragie = new Ragie({ auth: process.env.RAGIE_API_KEY });
  const summary = await ragie.documents.getSummary({ documentId: id });
  return NextResponse.json(summary);
}
