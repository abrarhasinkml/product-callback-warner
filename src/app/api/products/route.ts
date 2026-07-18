import { NextRequest, NextResponse } from "next/server";
import { createProduct } from "@/lib/db/operations";
import { matchProducts } from "@/lib/match";
import { triggerIngestIfNeeded } from "@/lib/ingest/trigger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: "Products array is required" },
        { status: 400 }
      );
    }

    const createdProducts = [];

    for (const product of products) {
      if (!product.name || typeof product.name !== "string") {
        continue;
      }

      const created = await createProduct({
        name: product.name.trim(),
        manufacturer: product.manufacturer?.trim() || null,
        lot_number: product.lot_number?.trim() || null,
      });
      createdProducts.push(created);
    }

    if (createdProducts.length === 0) {
      return NextResponse.json(
        { error: "No valid products provided" },
        { status: 400 }
      );
    }

    const matches = await matchProducts(createdProducts.map((p) => p.id));

    return NextResponse.json(
      {
        products: createdProducts,
        matches,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Product creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create products" },
      { status: 500 }
    );
  }
}
