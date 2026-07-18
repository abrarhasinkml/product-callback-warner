import { NextRequest, NextResponse } from "next/server";
import { getWarningsFiltered } from "@/lib/db/warnings";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state");
    const since = searchParams.get("since");
    const urgency = searchParams.get("urgency");
    const limit = parseInt(searchParams.get("limit") ?? "100", 10);

    const warnings = await getWarningsFiltered({ since, state, urgency, limit });

    return NextResponse.json({ warnings, total: warnings.length });
  } catch (error) {
    console.error("Failed to fetch warnings:", error);
    return NextResponse.json(
      { error: "Failed to fetch warnings" },
      { status: 500 }
    );
  }
}
