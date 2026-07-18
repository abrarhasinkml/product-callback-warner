import { NextResponse } from "next/server";
import { getStateCounts } from "@/lib/db/warnings";

export async function GET() {
  try {
    const states = await getStateCounts();
    const total_warnings = states.reduce((sum, s) => sum + s.warning_count, 0);

    return NextResponse.json({ states, total_warnings });
  } catch (error) {
    console.error("Failed to fetch state counts:", error);
    return NextResponse.json(
      { error: "Failed to fetch state counts" },
      { status: 500 }
    );
  }
}
