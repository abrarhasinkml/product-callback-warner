# Rules

Conventions, standards, and mandatory development rules for this project.

## General

- **Language:** All code and comments in English. User-facing copy and data
  (German warnings) stay in their original language.
- **TypeScript strict mode** is mandatory. No `any` without explicit justification.
- Every non-trivial function gets a short doc comment describing intent.
- TDD first, tests are important for everything in the project.
- No push to master or main branch. Always create PRs and wait for my approval.


## Git & Commits

- Branch per feature: `feat/...`, `fix/...`, `chore/...`.
- Commit messages: imperative, concise ("Add warning ingest scraper").
- Never commit secrets, `.env`, or receipt images with PII to the repo.
- Create issues, epics on Git and label them with priority according to roadmap.

## Documentation

- Update `PROGRESS.md` on **every** pass — it is the source of truth for status.
- Log any changed or new decision in `DECISION_LOGS.md` with date + rationale.
- Keep `ARCHITECTURE.md` in sync with the implemented system; mark it draft until
  confirmed.

## Data & Privacy

- **No auth yet** — do not introduce user accounts until explicitly decided.
- Receipt images contain PII. Store locally/minimally, never log OCR text to
  stdout in production, and allow deletion.
- Only ingest from the official source `lebensmittelwarnung.de`. Respect their
  robots/rate limits; cache results.

## Domain Rules

- The recall **`Grund`** is the authoritative input for urgency. Urgency tiers are
  rule-based and defined in one place (mapping table). Keep it swappable for an
  LLM later but do not hardcode tiers across files.
- Matching must always consider **lot/charge number** as a strong signal when
  present; never rely on product name alone for a "confirmed" match.

## Testing

- Scrapers/parsers get fixture-based tests (sample HTML from the source).
- Matching gets unit tests with known product/warning pairs (true positive,
  false positive, lot mismatch).
- OCR is tested with a sample receipt image fixture.

## Tooling

- Package manager: npm (default). Lockfile committed.
- Lint + format enforced (ESLint + Prettier) before merge.
