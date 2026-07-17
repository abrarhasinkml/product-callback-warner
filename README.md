# Product Callback Warner

A web application that checks whether products you've bought have been recalled,
using official German product safety warnings from
[lebensmittelwarnung.de](https://www.lebensmittelwarnung.de/DE/Home/home_node.html).

## Problem

Consumers rarely learn that a product they purchased has been recalled — whether
due to pathogens, foreign bodies, allergens, or harmful substances. This app lets
a user take a picture of a receipt or manually enter purchased products, then
cross-references them against the latest official warnings and reports:

- **Whether the product is currently being recalled**
- **An urgency rating** derived from the recall reason (Grund)
- **Potential health risks** described in the warning

## How it works (high level)

1. **Ingest warnings** — A scraper/worker pulls the latest meldungen (warnings)
   from lebensmittelwarnung.de, including product name, manufacturer, charge/lot
   numbers, the recall `Grund`, risk description, and affected regions. Stored in
   the database.
2. **Capture purchases** — The user uploads a receipt image (OCR via local
   Tesseract) or manually enters one or more products. Parsed products are
   persisted in the database.
3. **Match** — Each captured product is fuzzy-matched against stored warnings by
   product name + manufacturer + charge/lot number.
4. **Report** — Matched warnings are surfaced with an urgency tier and risk text.

## Tech stack (decided)

- **Framework:** Next.js (App Router) + TypeScript — UI and API routes in one repo.
- **Database:** PostgreSQL (SQLite for local dev).
- **OCR:** Local [Tesseract.js](https://github.com/naptha/tesseract.js) (no cloud
  dependency, runs server-side).
- **Matching:** Fuzzy text matching on product name + manufacturer + lot.
- **Urgency:** Rule-based mapping from warning `Grund` → urgency tier + risk text.

## No auth (for now)

There is **no customer registration or authentication flow** at the start. The app
is used anonymously: upload a receipt or enter products, get results. Persistence
of receipts/products is local to the session or a lightweight record, not tied to
an account.

## Project structure

Before every implementation pass, read `RULES.md`, `PROGRESS.md`, `ARCHITECTURE.md`,
and `DECISION_LOGS.md` to stay aligned with conventions and the current plan.

Planning documents (root):

- `README.md` — this file (project overview & task description)
- `ARCHITECTURE.md` — system design, data model, components (draft)
- `DECISION_LOGS.md` — chronicle of decisions and changes
- `PROGRESS.md` — phase tracking, updated every pass
- `RULES.md` — conventions and mandatory development rules

Planned application structure (created during implementation phases):

```
product-callback-warner/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API route handlers (server-side)
│   │   │   ├── ingest/           # Trigger warning ingestion
│   │   │   ├── receipts/         # Receipt upload + OCR
│   │   │   ├── products/         # Manual product entry
│   │   │   └── match/            # Run matching for products
│   │   ├── page.tsx              # Home: upload / manual entry
│   │   └── results/             # Results view with urgency + risk
│   ├── lib/
│   │   ├── db/                   # DB client + schema (warnings, receipts, products, matches)
│   │   ├── ingest/               # Scraper + parser for lebensmittelwarnung.de
│   │   ├── ocr/                  # Tesseract OCR service + receipt line parser
│   │   ├── match/                # Fuzzy matching (name + manufacturer + lot)
│   │   └── urgency/              # Rule-based Grund → tier + risk mapping
│   └── components/               # Client UI components (upload, forms, badges)
├── prisma/                       # Schema & migrations (or migrations/ for raw SQL)
├── tests/                        # Fixture-based tests (HTML, receipt image, match pairs)
├── docker/                       # Dockerfile & compose for app + Postgres
├── .env.example                  # Config template (no secrets committed)
└── package.json
```

See `ARCHITECTURE.md` for the data model behind `warnings`, `receipts`, `products`,
and `matches`, and `RULES.md` for the mandatory conventions applied to every path
above.

## Data source

lebensmittelwarnung.de publishes warnings with fields such as:

| Field | Example |
|-------|---------|
| Produktbezeichnung | verschiedene Rohwürste |
| Hersteller / Inverkehrbringer | Fleischwaren Wulff GmbH & Co KG |
| Chargennummer / Los | 622501, 622502, ... |
| Grund der Meldung | Krankheitserreger, Fremdkörper, Allergene, Gesundheitsschädliche Substanz, Rückstände und Kontaminanten, Sonstige Gründe |
| Mögliche Folgen | STEC/VTEC infection → diarrhea, abdominal pain |
| Betroffene Bundesländer | Bayern, Berlin, ... |
| Datum Erstveröffentlichung / Letzte Aktualisierung | 02.07.2026 / 15.07.2026 |

The "Grund" is the key input for the urgency rating.

## Status

Planning phase. See `PROGRESS.md` and `ARCHITECTURE.md`.
