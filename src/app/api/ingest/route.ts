import { NextRequest, NextResponse } from "next/server";
import { ingestWarnings } from "@/lib/ingest";

export async function POST(request: NextRequest) {
  try {
    const result = await ingestWarnings();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Ingestion failed:", error);
    return NextResponse.json(
      { error: "Failed to ingest warnings" },
      { status: 500 }
    );
  }
}
