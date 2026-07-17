# Decision Logs

A chronicle of decisions and changes made during the project. Each entry notes the
date, the decision, the rationale, and any alternatives considered.

---

## 2026-07-16 — Initial project setup & key decisions

**Context:** Starting a greenfield web app to check purchased products against
official German recall warnings (lebensmittelwarnung.de).

### Decisions

1. **Tech stack: Next.js (App Router) + TypeScript + PostgreSQL**
   - Rationale: Single repo for UI + API, fast to build, easy deploy.
   - Alternative considered: separate React + Express; rejected for added
     complexity early on.

2. **Database: PostgreSQL, with SQLite for local dev**
   - Rationale: Same schema, zero-setup local dev, production-grade in deploy.

3. **OCR: Local Tesseract.js (server-side)**
   - Rationale: No cloud dependency, free, keeps receipt data private.
   - Alternative: cloud vision API (Claude/Vision) — more accurate but needs API
     key and sends receipt images off-device; deferred.

4. **Matching: Fuzzy name + manufacturer + lot number**
   - Rationale: Balances recall and precision; lot numbers are decisive when
     present.
   - Alternative: exact-name-only (too many false positives).

5. **Urgency: Rule-based mapping from `Grund`**
   - Rationale: Deterministic, explainable, no per-request cost. Each Grund maps
     to a fixed urgency tier + default risk text.
   - Alternative: LLM-generated — deferred; design keeps it swappable.

6. **No auth / registration at the start**
   - Rationale: Lower barrier to use; receipts/products persisted without an
     account. Revisit if multi-device/session needs arise.

### Source data confirmed
lebensmittelwarnung.de detail pages expose: product name, manufacturer/importer,
charge/lot numbers, `Grund` (recall reason), "Mögliche Folgen" (risk), affected
federal states, publication & update dates. Fully scrapeable.

---

## 2026-07-17 — Implementation pass (Phase 1–5 core)

**Context:** Build the MVP end-to-end: scaffold Next.js 16 + TS, Postgres schema,
warning ingestion from lebensmittelwarnung.de, receipt upload/OCR, manual entry,
fuzzy matching, and results UI.

### Decisions / outcomes
1. **Next.js 16 + Turbopack** chosen (latest; `next.config.ts` uses
   `serverExternalPackages` — `experimental.serverComponentsExternalPackages`
   was removed in v16).
2. **DB-driven migrations** via `src/lib/db/migrate.ts` (tsx runner, idempotent
   via `migrations` table). Pool reads `DATABASE_URL`.
3. **Live scraper verified**: 17 current warnings ingested with 0 errors; parser
   handles the real `<dl>` description-list markup, `lmw-badge` for `Grund`,
   `<time datetime>` for dates, and comma/Charge-formatted lot numbers.
4. **Matching**: Fuse.js fuzzy score on name (0.6) + manufacturer (0.3) + lot
   (0.1), boosted +0.2 on manufacturer match, +0.3 on lot match; persists matches
   with urgency tier from `Grund`.
5. **OCR**: Tesseract.js wired server-side (`deu` lang); receipt line parser
   extracts candidate products. Real-image fixture test still TODO.

### Known blockers (3-attempt rule hit)
- **ESLint**: `eslint-config-next@16` flat config triggers a circular-plugin
  JSON error under FlatCompat and as a direct import. Tried (a) FlatCompat +
  `next/core-web-vitals`, (b) direct array spread, (c) `next/typescript` — all
  failed. Lint script is non-blocking; `next build` (type-check) is the gate.
  Resolution deferred: pin ESLint config or migrate to `eslint-config-next`
  when a compatible flat export ships.
- **Port 5432 conflict**: a separate local Postgres already binds 5432 on the
  host, intercepting connections. Dev/CI Postgres container now maps to **5433**.
- **postcss moderation advisory**: 2 moderate vulns require a breaking Next.js
  downgrade; deferred.
