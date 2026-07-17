export type UrgencyTier = "critical" | "high" | "medium" | "low" | "info";

export interface UrgencyRule {
  grund: string;
  tier: UrgencyTier;
  defaultRiskText: string;
  description: string;
}

export const URGENCY_RULES: UrgencyRule[] = [
  {
    grund: "Krankheitserreger",
    tier: "critical",
    defaultRiskText:
      "Pathogens detected. Consumption may cause serious illness. Seek medical attention if symptoms occur.",
    description: "Microbiological contamination (bacteria, viruses, parasites)",
  },
  {
    grund: "Gesundheitsschädliche Substanz",
    tier: "critical",
    defaultRiskText:
      "Harmful substance detected. Do not consume or use. May cause acute or long-term health damage.",
    description: "Chemical contamination, toxins, or hazardous materials",
  },
  {
    grund: "Allergene",
    tier: "high",
    defaultRiskText:
      "Undeclared allergens present. Risk of severe allergic reactions for sensitive individuals.",
    description: "Allergens not listed on packaging",
  },
  {
    grund: "Fremdkörper",
    tier: "high",
    defaultRiskText:
      "Foreign objects detected. Risk of injury or choking. Do not consume.",
    description: "Physical contamination (glass, metal, plastic fragments)",
  },
  {
    grund: "Rückstände und Kontaminanten",
    tier: "medium",
    defaultRiskText:
      "Residues or contaminants above safe levels. Potential long-term health risk with repeated exposure.",
    description: "Pesticides, heavy metals, or other chemical residues",
  },
  {
    grund: "Sonstige Gründe",
    tier: "low",
    defaultRiskText:
      "Other quality or labeling issues. No immediate health risk identified, but product should not be consumed.",
    description: "Miscellaneous reasons not covered above",
  },
];

export function getUrgencyByGrund(grund: string): UrgencyRule | undefined {
  return URGENCY_RULES.find((rule) => rule.grund === grund);
}

export function getUrgencyTier(grund: string): UrgencyTier {
  const rule = getUrgencyByGrund(grund);
  return rule?.tier ?? "info";
}

export function getDefaultRiskText(grund: string): string {
  const rule = getUrgencyByGrund(grund);
  return rule?.defaultRiskText ?? "Unknown risk. Exercise caution.";
}

export function getAllGrunde(): string[] {
  return URGENCY_RULES.map((rule) => rule.grund);
}
