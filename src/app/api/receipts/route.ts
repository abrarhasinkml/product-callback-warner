import { NextRequest, NextResponse } from "next/server";
import { createWorker } from "tesseract.js";
import { createReceipt, createProduct } from "@/lib/db/operations";
import { matchProducts } from "@/lib/match";
import { triggerIngestIfNeeded } from "@/lib/ingest/trigger";

const TESSERACT_TIMEOUT_MS = 45_000;

async function runOcr(buffer: Buffer): Promise<string> {
  const worker = await createWorker("deu", undefined, {
    langPath: "https://tessdata.projectnaptha.com/4.0.0",
  });

  const result = await Promise.race([
    worker.recognize(buffer).then((r) => {
      worker.terminate();
      return r.data.text;
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => {
        worker.terminate();
        reject(new Error("OCR timed out"));
      }, TESSERACT_TIMEOUT_MS)
    ),
  ]);

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("receipt") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No receipt file provided" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let text = "";
    try {
      text = await runOcr(buffer);
    } catch (ocrError) {
      console.error("OCR failed, continuing without extracted text:", ocrError);
    }

    const receipt = await createReceipt({
      image_path: file.name,
      raw_ocr_text: text || null,
    });

    const products = parseReceiptText(text);
    const createdProducts = [];

    for (const product of products) {
      const created = await createProduct({
        receipt_id: receipt.id,
        name: product.name,
        manufacturer: product.manufacturer,
        lot_number: product.lot_number,
      });
      createdProducts.push(created);
    }

    const matches =
      createdProducts.length > 0
        ? await matchProducts(createdProducts.map((p) => p.id))
        : [];

    triggerIngestIfNeeded();

    return NextResponse.json(
      {
        receipt,
        products: createdProducts,
        matches,
        ocr_warning:
          text.length === 0
            ? "OCR could not extract text from this image; try manual entry."
            : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Receipt processing failed:", error);
    return NextResponse.json(
      { error: "Failed to process receipt" },
      { status: 500 }
    );
  }
}

function parseReceiptText(text: string): Array<{
  name: string;
  manufacturer: string | null;
  lot_number: string | null;
}> {
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  const products: Array<{
    name: string;
    manufacturer: string | null;
    lot_number: string | null;
  }> = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 3 || trimmed.length > 100) continue;
    if (/^\d+$/.test(trimmed)) continue;
    if (/^(EUR|€|CHF|\$)/.test(trimmed)) continue;
    if (/^(Summe|Total|MwSt|VAT|Tax)/i.test(trimmed)) continue;
    if (/^(Karte|Bar|Cash|Change)/i.test(trimmed)) continue;

    const lotMatch = trimmed.match(/(?:L|Lot|Charge|Chg)[:\s]*(\d+)/i);
    const lotNumber = lotMatch ? lotMatch[1] : null;

    const name = trimmed.replace(/(?:L|Lot|Charge|Chg)[:\s]*\d+/i, "").trim();

    if (name.length >= 3) {
      products.push({
        name,
        manufacturer: null,
        lot_number: lotNumber,
      });
    }
  }

  return products.slice(0, 20);
}
