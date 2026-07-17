import { computeMatches } from "@/lib/match";
import { Warning } from "@/lib/db/warnings";

const MOCK_WARNING: Warning = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  source_url: "https://example.com/warning1",
  product_name: "verschiedene Rohwürste",
  manufacturer: "Fleischwaren Wulff GmbH & Co KG",
  lot_numbers: ["622501", "622502"],
  grund: "Krankheitserreger",
  risk_description: "STEC/VTEC infection risk",
  affected_states: ["Bayern", "Berlin"],
  published_at: new Date("2026-07-02"),
  updated_at: new Date("2026-07-15"),
  urgency_tier: "critical",
  created_at: new Date(),
  updated_at_db: new Date(),
};

describe("Match Service", () => {
  it("should match product with exact name", () => {
    const product = {
      id: "product-1",
      name: "verschiedene Rohwürste",
      manufacturer: null,
      lot_number: null,
    };

    const matches = computeMatches(product, [MOCK_WARNING]);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].warning.product_name).toBe("verschiedene Rohwürste");
  });

  it("should match product with similar name", () => {
    const product = {
      id: "product-2",
      name: "verschiedene Rohwuerste",
      manufacturer: null,
      lot_number: null,
    };

    const matches = computeMatches(product, [MOCK_WARNING]);
    expect(matches.length).toBeGreaterThan(0);
  });

  it("should boost score for manufacturer match", () => {
    const productWithoutManufacturer = {
      id: "product-3",
      name: "Rohwürste",
      manufacturer: null,
      lot_number: null,
    };

    const productWithManufacturer = {
      id: "product-4",
      name: "Rohwürste",
      manufacturer: "Fleischwaren Wulff",
      lot_number: null,
    };

    const matchesWithout = computeMatches(productWithoutManufacturer, [MOCK_WARNING]);
    const matchesWith = computeMatches(productWithManufacturer, [MOCK_WARNING]);

    expect(matchesWith[0].match_score).toBeGreaterThan(matchesWithout[0].match_score);
  });

  it("should boost score for lot number match", () => {
    const productWithoutLot = {
      id: "product-5",
      name: "Rohwürste",
      manufacturer: null,
      lot_number: null,
    };

    const productWithLot = {
      id: "product-6",
      name: "Rohwürste",
      manufacturer: null,
      lot_number: "622501",
    };

    const matchesWithout = computeMatches(productWithoutLot, [MOCK_WARNING]);
    const matchesWith = computeMatches(productWithLot, [MOCK_WARNING]);

    expect(matchesWith[0].match_score).toBeGreaterThan(matchesWithout[0].match_score);
  });

  it("should return urgency tier based on grund", () => {
    const product = {
      id: "product-7",
      name: "verschiedene Rohwürste",
      manufacturer: null,
      lot_number: null,
    };

    const matches = computeMatches(product, [MOCK_WARNING]);
    expect(matches[0].urgency_tier).toBe("critical");
  });

  it("should not match unrelated product", () => {
    const product = {
      id: "product-8",
      name: "Completely Different Product",
      manufacturer: null,
      lot_number: null,
    };

    const matches = computeMatches(product, [MOCK_WARNING]);
    expect(matches.length).toBe(0);
  });
});
