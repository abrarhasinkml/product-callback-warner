# Architecture

> Draft — to be finalized once the implementation plan is confirmed.

## Overview

A single Next.js (App Router, TypeScript) application. Server-side code handles
warning ingestion, OCR, matching, and the Postgres data layer. Client components
handle receipt upload and product entry. 

Dockerize the application from the beginning to ensure that there is less friction when migrating.

```
┌─────────────┐     upload      ┌──────────────────┐
│  Browser    │ ───────────────▶│  Next.js Routes  │
│  (client)   │                 │  (App Router)    │
└─────────────┘                 └────────┬─────────┘
                                         │
                    ┌────────────────────┼─────────────────────┐
                    ▼                    ▼                     ▼
            ┌──────────────┐   ┌────────────────┐   ┌──────────────────┐
            │ Receipt OCR  │   │  Match Service  │   │  Warning Ingest  │
            │ (Tesseract)  │   │ (fuzzy + lot)   │   │  (scraper)       │
            └──────┬───────┘   └────────┬───────┘   └────────┬─────────┘
                   │                    │                    │
                   └────────────────────┼────────────────────┘
                                        ▼
                                ┌──────────────┐
                                │  PostgreSQL  │
                                │  (SQLite dev)│
                                └──────────────┘
```

## Data model (proposed)

**warnings** (ingested from lebensmittelwarnung.de)
- `id` (pk)
- `source_url`
- `product_name`
- `manufacturer`
- `lot_numbers` (array / text)
- `grund` (enum: Krankheitserreger, Fremdkörper, Allergene, Gesundheitsschädliche Substanz, Rückstände und Kontaminanten, Sonstige Gründe)
- `risk_description`
- `affected_states` (array)
- `published_at`, `updated_at`
- `urgency_tier` (derived, see below)

**receipts**
- `id` (pk)
- `image_path` (stored file / object)
- `raw_ocr_text`
- `created_at`

**products** (parsed from receipt or manual entry)
- `id` (pk)
- `receipt_id` (nullable fk)
- `name`
- `manufacturer` (nullable)
- `lot_number` (nullable)
- `created_at`

**matches** (result of matching a product against warnings)
- `id` (pk)
- `product_id` (fk)
- `warning_id` (fk)
- `match_score`
- `urgency_tier`
- `risk_text`
- `created_at`

## Components

1. **Warning Ingest Worker** — periodically fetches the meldungen list and detail
   pages, parses structured fields, upserts into `warnings`. Runs on a schedule
   (cron / route handler) or manually.
2. **OCR Service** — receives an uploaded receipt image, runs Tesseract.js
   server-side, returns raw text. A lightweight line parser extracts candidate
   product names (and optionally manufacturer/lot if present).
3. **Match Service** — fuzzy-matches each `product` against `warnings` using
   name + manufacturer + lot, computes a score, and attaches urgency + risk.
4. **Urgency Rules** — a static mapping from `grund` to an urgency tier and
   default risk text (see RULES.md / decision log). Designed to be swappable
   for an LLM later.
5. **UI** — receipt upload + manual product entry form, results view showing
   matched warnings with urgency badges.

## Matching strategy

- Normalize product name and manufacturer (lowercase, strip punctuation).
- Fuzzy similarity (e.g. Levenshtein / token overlap) on name.
- Boost score when manufacturer matches.
- Strong match when lot number is present and equals a warning lot.
- Threshold determines whether a warning is "matched".

## Open questions

- Exact scheduler for ingest (cron vs on-demand).
- Receipt image storage (local disk vs object storage).
- Whether products/receipts persist across sessions without auth (session id vs
  ephemeral).
