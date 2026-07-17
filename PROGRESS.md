# Progress

Tracks project phases. **This file MUST be updated on every pass.**

---

## Phase 0 — Planning & Documentation (DONE)
- [x] Confirm data source structure (lebensmittelwarnung.de warning fields)
- [x] Decide tech stack (Next.js + Postgres)
- [x] Decide OCR approach (local Tesseract)
- [x] Decide matching strategy (fuzzy name + lot)
- [x] Decide urgency model (rule-based by Grund)
- [x] Decide no-auth starting point
- [x] Create README.md (+ project structure section)
- [x] Create ARCHITECTURE.md (draft)
- [x] Create DECISION_LOGS.md
- [x] Create RULES.md
- [x] Create PROGRESS.md (this file)
- [x] Finalize ARCHITECTURE.md open questions (resolved in DECISION_LOGS)
- [x] Scaffold Next.js project

## Phase 1 — Foundation (DONE)
- [x] Scaffold Next.js 16 + TypeScript project (App Router, standalone output)
- [x] Set up Postgres schema (warnings, receipts, products, matches) + migrations
- [x] DB client (pg Pool) with env-driven DATABASE_URL
- [x] Docker + docker-compose (app + Postgres)
- [x] Tailwind CSS v4 setup

## Phase 2 — Warning Ingestion (DONE)
- [x] Scraper for meldungen list + detail pages (rate-limited fetch)
- [x] Parser for structured fields (product, manufacturer, lot, grund, risk, states, dates)
- [x] Upsert into `warnings` (ON CONFLICT by source_url)
- [x] Urgency rule mapping by Grund
- [x] Verified live: 17 warnings ingested, 0 errors

## Phase 3 — Receipt Capture & OCR (DONE — OCR pending real image test)
- [x] Receipt image upload endpoint (/api/receipts) + local storage
- [x] Tesseract OCR service wired (createWorker("deu"))
- [x] Receipt line parser → products
- [x] Manual product entry form + /api/products endpoint
- [ ] OCR tested with a real receipt image fixture (logged: no fixture yet)

## Phase 4 — Matching & Reporting (DONE)
- [x] Fuzzy match service (Fuse.js: name + manufacturer + lot scoring)
- [x] Compute + persist matches with urgency tier
- [x] Results UI with urgency badges + risk text
- [x] Integration test: DB-backed match flow verified

## Phase 5 — Polish (IN PROGRESS)
- [x] Unit tests (urgency, parser, match) — 25 passing
- [x] Integration test (DB match) — passing with Docker Postgres :5433
- [x] Production build passes (next build, type-check clean)
- [ ] ESLint gate (BLOCKED: see DECISION_LOGS — eslint-config-next v16 flat-config circular error; 3 fix attempts failed)
- [ ] Scheduler for ingestion (cron/on-demand) — not yet added
- [ ] OCR real-image fixture test
- [ ] Deploy config review

## Known Issues (logged)
- ESLint flat config incompatible with eslint-config-next@16 (circular plugin ref). Lint script disabled pending resolution. `next build` (type-check) is the current gate.
- Host port 5432 occupied by a separate local Postgres; dev/CI container uses 5433.
- 2 moderate postcss vulnerabilities (require breaking Next.js downgrade — deferred).
