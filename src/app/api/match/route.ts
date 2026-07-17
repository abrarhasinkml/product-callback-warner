import { NextRequest, NextResponse } from "next/server";
import { matchProducts } from "@/lib/match";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_ids } = body;

    if (!Array.isArray(product_ids) || product_ids.length === 0) {
      return NextResponse.json(
        { error: "product_ids array is required" },
        { status: 400 }
      );
    }

    const matches = await matchProducts(product_ids);

    return NextResponse.json({ matches }, { status: 200 });
  } catch (error) {
    console.error("Matching failed:", error);
    return NextResponse.json(
      { error: "Failed to match products" },
      { status: 500 }
    );
  }
}
