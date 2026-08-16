import { NextRequest, NextResponse } from "next/server";
import { createReceipt, createProduct } from "@/lib/db/operations";
import { matchProducts } from "@/lib/match";
import { parseReceiptText } from "@/lib/ocr/parser";

async function runServerOcr(buffer: Buffer): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("deu", undefined, {
    langPath: "https://tessdata.projectnaptha.com/4.0.0",
  });

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => {
      worker.terminate();
      reject(new Error("OCR timed out"));
    }, 45_000)
  );

  const ocr = worker.recognize(buffer).then((r) => {
    worker.terminate();
    return r.data.text;
  });

  return Promise.race([ocr, timeout]);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("receipt") as File | null;
    const clientText = formData.get("text") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No receipt file provided" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Use client-provided text if available, otherwise run server-side OCR
    let text = clientText || "";

    if (!text) {
      try {
        text = await runServerOcr(buffer);
      } catch (ocrError) {
        console.error("Server OCR failed, continuing without extracted text:", ocrError);
      }
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
