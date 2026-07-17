import { parseWarningList, parseWarningDetail, parseGermanDate } from "@/lib/ingest/parser";
import { getUrgencyTier } from "@/lib/urgency";

const BASE = "https://www.lebensmittelwarnung.de";

async function main() {
  const res = await fetch(`${BASE}/DE/Home/home_node.html`, {
    headers: { "User-Agent": "ProductCallbackWarner/1.0" },
  });
  const html = await res.text();
  const urls = parseWarningList(html);
  console.log("Found warning links:", urls.length);
  if (urls.length === 0) {
    console.log("No links parsed — check parser/regex against live HTML.");
    return;
  }
  const full = urls[0].startsWith("http") ? urls[0] : `${BASE}${urls[0]}`;
  const detail = await fetch(full, {
    headers: { "User-Agent": "ProductCallbackWarner/1.0" },
  });
  const dhtml = await detail.text();
  const parsed = parseWarningDetail(dhtml, full);
  console.log("Sample parsed warning:", {
    product_name: parsed.product_name,
    manufacturer: parsed.manufacturer,
    grund: parsed.grund,
    lot_numbers: parsed.lot_numbers,
    affected_states: parsed.affected_states,
    published_at: parsed.published_at,
    updated_at: parsed.updated_at,
    urgency_tier: getUrgencyTier(parsed.grund),
    iso_published: parseGermanDate(parsed.published_at),
  });
}

main().catch((e) => {
  console.error("LIVE CHECK FAILED:", e);
  process.exit(1);
});
