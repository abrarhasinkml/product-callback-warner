import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { createWarning } from "@/lib/db/warnings";
import { createProduct, createMatch, getMatchesByProductId } from "@/lib/db/operations";
import { computeMatches } from "@/lib/match";
import { getUrgencyTier, getDefaultRiskText } from "@/lib/urgency";

const DATABASE_URL = process.env.DATABASE_URL;

const maybe = DATABASE_URL ? describe : describe.skip;

maybe("Integration: DB-backed match flow", () => {
  const productId = "11111111-1111-1111-1111-111111111111";
  const warningId = "22222222-2222-2222-2222-222222222222";

  beforeAll(async () => {
    await createWarning({
      source_url: "https://example.com/integration-warning",
      product_name: "Test Rohwurst",
      manufacturer: "Test GmbH",
      lot_numbers: ["LOT123"],
      grund: "Krankheitserreger",
      risk_description: "Pathogen risk",
      affected_states: ["Bayern"],
      published_at: "2026-07-01",
      updated_at: "2026-07-15",
      urgency_tier: getUrgencyTier("Krankheitserreger"),
    });
  });

  it("should create a product and persist a match", async () => {
    const product = await createProduct({
      name: "Test Rohwurst",
      manufacturer: "Test GmbH",
      lot_number: "LOT123",
    });

    const warnings = await (await import("@/lib/db/warnings")).getWarnings();
    const warning = warnings.find((w) => w.product_name === "Test Rohwurst")!;
    expect(warning).toBeDefined();

    const matches = computeMatches(
      { id: product.id, name: product.name, manufacturer: product.manufacturer, lot_number: product.lot_number },
      warnings
    );
    expect(matches.length).toBeGreaterThan(0);

    await createMatch({
      product_id: product.id,
      warning_id: warning.id,
      match_score: matches[0].match_score,
      urgency_tier: matches[0].urgency_tier,
      risk_text: matches[0].risk_text,
    });

    const stored = await getMatchesByProductId(product.id);
    expect(stored.length).toBeGreaterThan(0);
    expect(stored[0].urgency_tier).toBe("critical");
  });

  afterAll(async () => {
    const { pool } = await import("@/lib/db");
    await pool.end();
  });
});
