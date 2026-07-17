import { ingestWarnings } from "@/lib/ingest";

async function main() {
  console.log("Starting ingest...");
  const result = await ingestWarnings();
  console.log("Ingest result:", result);
}

main().catch((e) => {
  console.error("INGEST FAILED:", e);
  process.exit(1);
});
