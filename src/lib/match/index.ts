import Fuse from "fuse.js";
import { getWarnings, Warning } from "@/lib/db/warnings";
import { getProductById, createMatch } from "@/lib/db/operations";
import { getUrgencyTier, getDefaultRiskText } from "@/lib/urgency";

export interface MatchResult {
  product_id: string;
  product_name: string;
  warning: Warning;
  match_score: number;
  urgency_tier: string;
  risk_text: string;
}

export async function matchProducts(productIds: string[]): Promise<MatchResult[]> {
  const warnings = await getWarnings();
  const results: MatchResult[] = [];

  for (const productId of productIds) {
    const product = await getProductById(productId);
    if (!product) continue;

    const productMatches = await matchProduct(product, warnings);
    results.push(...productMatches);
  }

  return results;
}

export async function matchProduct(
  product: { id: string; name: string; manufacturer: string | null; lot_number: string | null },
  warnings: Warning[]
): Promise<MatchResult[]> {
  const matches = await computeMatches(product, warnings);

  for (const match of matches) {
    await createMatch({
      product_id: match.product_id,
      warning_id: match.warning.id,
      match_score: match.match_score,
      urgency_tier: match.urgency_tier,
      risk_text: match.risk_text,
    });
  }

  return matches;
}

export function computeMatches(
  product: { id: string; name: string; manufacturer: string | null; lot_number: string | null },
  warnings: Warning[]
): MatchResult[] {
  const fuse = new Fuse(warnings, {
    keys: [
      { name: "product_name", weight: 0.6 },
      { name: "manufacturer", weight: 0.3 },
      { name: "lot_numbers", weight: 0.1 },
    ],
    threshold: 0.4,
    includeScore: true,
  });

  const searchResults = fuse.search(product.name);
  const matches: MatchResult[] = [];

  for (const result of searchResults) {
    const warning = result.item;
    const baseScore = result.score ?? 1;
    let finalScore = 1 - baseScore;

    if (product.manufacturer && warning.manufacturer) {
      const manufacturerMatch = product.manufacturer
        .toLowerCase()
        .includes(warning.manufacturer.toLowerCase()) ||
        warning.manufacturer
          .toLowerCase()
          .includes(product.manufacturer.toLowerCase());
      if (manufacturerMatch) {
        finalScore += 0.2;
      }
    }

    if (product.lot_number && warning.lot_numbers) {
      const lotMatch = warning.lot_numbers.includes(product.lot_number);
      if (lotMatch) {
        finalScore += 0.3;
      }
    }

    finalScore = Math.min(finalScore, 1);

    if (finalScore >= 0.5) {
      const urgencyTier = getUrgencyTier(warning.grund);
      const riskText = warning.risk_description || getDefaultRiskText(warning.grund);

      matches.push({
        product_id: product.id,
        product_name: product.name,
        warning,
        match_score: finalScore,
        urgency_tier: urgencyTier,
        risk_text: riskText,
      });
    }
  }

  return matches.sort((a, b) => b.match_score - a.match_score);
}
