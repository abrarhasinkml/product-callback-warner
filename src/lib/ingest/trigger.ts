import { ingestWarnings } from "./index";

const COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes
let lastRun = 0;
let running = false;

/**
 * Triggers warning ingestion in the background if not already running
 * and the cooldown has elapsed. Returns immediately — does not block.
 */
export function triggerIngestIfNeeded(): void {
  if (running) return;
  if (Date.now() - lastRun < COOLDOWN_MS) return;

  running = true;
  lastRun = Date.now();

  ingestWarnings()
    .then(({ ingested, errors }) => {
      console.log(
        `[ingest-trigger] Background ingestion complete: ${ingested} ingested, ${errors} errors`
      );
    })
    .catch((error) => {
      console.error("[ingest-trigger] Background ingestion failed:", error);
    })
    .finally(() => {
      running = false;
    });
}
