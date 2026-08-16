/**
 * Receipt text parser — extracts product names, manufacturers, and lot numbers
 * from OCR-extracted receipt text.
 */

interface ParsedProduct {
  name: string;
  manufacturer: string | null;
  lot_number: string | null;
}

/**
 * Parse OCR text from a receipt and extract candidate products.
 *
 * Filters out summary lines, currency lines, payment methods, and
 * extracts lot numbers when present. Returns up to 20 products.
 */
export function parseReceiptText(text: string): ParsedProduct[] {
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  const products: ParsedProduct[] = [];

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
