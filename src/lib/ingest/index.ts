import { parseWarningList, parseWarningDetail, parseGermanDate } from "./parser";
import { getUrgencyTier } from "@/lib/urgency";
import { createWarning } from "@/lib/db/warnings";

const BASE_URL = "https://www.lebensmittelwarnung.de";
const LIST_URL = `${BASE_URL}/DE/Home/home_node.html`;

const RATE_LIMIT_MS = 1000;

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithDelay(url: string): Promise<string> {
  await delay(RATE_LIMIT_MS);
  const response = await fetch(url, {
    headers: {
      "User-Agent": "ProductCallbackWarner/1.0 (+https://github.com)",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
}

export async function ingestWarnings(): Promise<{
  ingested: number;
  errors: number;
}> {
  let ingested = 0;
  let errors = 0;

  try {
    const listHtml = await fetchWithDelay(LIST_URL);
    const detailUrls = parseWarningList(listHtml);

    console.log(`Found ${detailUrls.length} warnings to ingest`);

    for (const url of detailUrls) {
      try {
        const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
        const detailHtml = await fetchWithDelay(fullUrl);
        const parsed = parseWarningDetail(detailHtml, fullUrl);

        await createWarning({
          source_url: parsed.source_url,
          product_name: parsed.product_name,
          manufacturer: parsed.manufacturer,
          lot_numbers: parsed.lot_numbers,
          grund: parsed.grund,
          risk_description: parsed.risk_description,
          affected_states: parsed.affected_states,
          published_at: parseGermanDate(parsed.published_at),
          updated_at: parseGermanDate(parsed.updated_at),
          urgency_tier: getUrgencyTier(parsed.grund),
        });

        ingested++;
        console.log(`Ingested: ${parsed.product_name}`);
      } catch (error) {
        errors++;
        console.error(`Failed to ingest ${url}:`, error);
      }
    }
  } catch (error) {
    console.error("Failed to fetch warning list:", error);
    throw error;
  }

  return { ingested, errors };
}
