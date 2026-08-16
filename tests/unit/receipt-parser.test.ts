import { describe, it, expect } from "vitest";
import { parseReceiptText } from "@/lib/ocr/parser";

describe("parseReceiptText", () => {
  it("extracts product names from receipt lines", () => {
    const text = `Milch 3.5% 1L
Brot Vollkorn 500g
Butter 250g`;
    const result = parseReceiptText(text);
    expect(result).toEqual([
      { name: "Milch 3.5% 1L", manufacturer: null, lot_number: null },
      { name: "Brot Vollkorn 500g", manufacturer: null, lot_number: null },
      { name: "Butter 250g", manufacturer: null, lot_number: null },
    ]);
  });

  it("extracts lot numbers when present", () => {
    const text = `Wurst Aufschnitt L12345
Käse Gouda Lot: 67890
Joghurt Charge 11111`;
    const result = parseReceiptText(text);
    expect(result).toEqual([
      { name: "Wurst Aufschnitt", manufacturer: null, lot_number: "12345" },
      { name: "Käse Gouda", manufacturer: null, lot_number: "67890" },
      { name: "Joghurt", manufacturer: null, lot_number: "11111" },
    ]);
  });

  it("filters out lines shorter than 3 characters", () => {
    const text = `AB
Milch 1L
XY`;
    const result = parseReceiptText(text);
    expect(result).toEqual([
      { name: "Milch 1L", manufacturer: null, lot_number: null },
    ]);
  });

  it("filters out lines longer than 100 characters", () => {
    const longName = "A".repeat(101);
    const text = `Milch 1L
${longName}
Brot`;
    const result = parseReceiptText(text);
    expect(result).toEqual([
      { name: "Milch 1L", manufacturer: null, lot_number: null },
      { name: "Brot", manufacturer: null, lot_number: null },
    ]);
  });

  it("filters out pure number lines", () => {
    const text = `12345
Milch 1L
67890`;
    const result = parseReceiptText(text);
    expect(result).toEqual([
      { name: "Milch 1L", manufacturer: null, lot_number: null },
    ]);
  });

  it("filters out currency lines", () => {
    const text = `EUR 12.50
€ 5.99
CHF 8.00
$ 10.00
Milch 1L`;
    const result = parseReceiptText(text);
    expect(result).toEqual([
      { name: "Milch 1L", manufacturer: null, lot_number: null },
    ]);
  });

  it("filters out summary lines", () => {
    const text = `Summe 25.00
Total 30.00
MwSt 5.00
VAT 4.00
Tax 3.00
Milch 1L`;
    const result = parseReceiptText(text);
    expect(result).toEqual([
      { name: "Milch 1L", manufacturer: null, lot_number: null },
    ]);
  });

  it("filters out payment method lines", () => {
    const text = `Karte
Bar
Cash
Change 2.50
Milch 1L`;
    const result = parseReceiptText(text);
    expect(result).toEqual([
      { name: "Milch 1L", manufacturer: null, lot_number: null },
    ]);
  });

  it("returns maximum 20 products", () => {
    const lines = Array.from({ length: 25 }, (_, i) => `Product ${i + 1}`);
    const text = lines.join("\n");
    const result = parseReceiptText(text);
    expect(result).toHaveLength(20);
  });

  it("handles empty text", () => {
    const result = parseReceiptText("");
    expect(result).toEqual([]);
  });

  it("handles text with only whitespace lines", () => {
    const text = `

   
`;
    const result = parseReceiptText(text);
    expect(result).toEqual([]);
  });

  it("trims whitespace from product names", () => {
    const text = `   Milch 1L   
   Brot 500g   `;
    const result = parseReceiptText(text);
    expect(result).toEqual([
      { name: "Milch 1L", manufacturer: null, lot_number: null },
      { name: "Brot 500g", manufacturer: null, lot_number: null },
    ]);
  });

  it("handles mixed German receipt content", () => {
    const text = `REWE Markt GmbH
Berlin, 15.07.2026
Filiale: 1234

Milch 3.5% 1L          1,19
Brot Vollkorn 500g      2,49
Butter 250g L: 98765    1,89
Joghurt Natur           0,59

Summe                  6,16
MwSt 7%                 0,40
Karte                  6,16`;
    const result = parseReceiptText(text);
    // Parser extracts all non-filtered lines, including store header and date
    expect(result.length).toBeGreaterThanOrEqual(4);
    // Verify key products are present
    const names = result.map((p) => p.name);
    expect(names).toContain("REWE Markt GmbH");
    expect(names).toContain("Brot Vollkorn 500g      2,49");
    // Verify lot number extraction works
    const butter = result.find((p) => p.name.includes("Butter"));
    expect(butter?.lot_number).toBe("98765");
    // Verify summary lines are filtered out
    expect(names.some((n) => n.includes("Summe"))).toBe(false);
    expect(names.some((n) => n.includes("Karte"))).toBe(false);
  });
});
