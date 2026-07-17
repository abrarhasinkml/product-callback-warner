import { getUrgencyTier, getDefaultRiskText } from "@/lib/urgency";

describe("Urgency Rules", () => {
  it("should return critical for Krankheitserreger", () => {
    expect(getUrgencyTier("Krankheitserreger")).toBe("critical");
  });

  it("should return critical for Gesundheitsschädliche Substanz", () => {
    expect(getUrgencyTier("Gesundheitsschädliche Substanz")).toBe("critical");
  });

  it("should return high for Allergene", () => {
    expect(getUrgencyTier("Allergene")).toBe("high");
  });

  it("should return high for Fremdkörper", () => {
    expect(getUrgencyTier("Fremdkörper")).toBe("high");
  });

  it("should return medium for Rückstände und Kontaminanten", () => {
    expect(getUrgencyTier("Rückstände und Kontaminanten")).toBe("medium");
  });

  it("should return low for Sonstige Gründe", () => {
    expect(getUrgencyTier("Sonstige Gründe")).toBe("low");
  });

  it("should return info for unknown grund", () => {
    expect(getUrgencyTier("Unknown")).toBe("info");
  });

  it("should return default risk text for known grund", () => {
    const riskText = getDefaultRiskText("Krankheitserreger");
    expect(riskText).toContain("Pathogens detected");
  });

  it("should return fallback risk text for unknown grund", () => {
    const riskText = getDefaultRiskText("Unknown");
    expect(riskText).toBe("Unknown risk. Exercise caution.");
  });
});
