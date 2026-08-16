/**
 * Client-side OCR runner — runs Tesseract.js in the browser.
 *
 * Downloads the WASM binary and German language data once, then caches
 * in the browser for subsequent uses. Works on any deployment target
 * (Vercel, self-hosted, etc.) since processing happens client-side.
 */

export interface OcrProgress {
  status: string;
  progress: number;
}

export interface OcrResult {
  text: string;
  confidence: number;
}

/**
 * Run OCR on an image file using Tesseract.js in the browser.
 *
 * @param file - The receipt image file to process
 * @param onProgress - Optional callback for progress updates (0-1)
 * @returns Extracted text and confidence score
 */
export async function runClientOcr(
  file: File,
  onProgress?: (progress: OcrProgress) => void
): Promise<OcrResult> {
  const { createWorker } = await import("tesseract.js");

  const worker = await createWorker("deu", undefined, {
    langPath: "https://tessdata.projectnaptha.com/4.0.0",
    logger: (m: { status: string; progress: number }) => {
      onProgress?.({
        status: m.status,
        progress: m.progress,
      });
    },
  });

  try {
    const {
      data: { text, confidence },
    } = await worker.recognize(file);
    return { text, confidence };
  } finally {
    await worker.terminate();
  }
}
