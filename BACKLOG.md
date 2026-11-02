# Sable Ledger | 30-day delivery plan

## Outcome and daily cycle
Deliver an operational inventory product for independent design retail: trusted catalog data, auditable movements, purchasing, staff roles, reports and a release guide. Every day includes code review of prior work, test writing/updating, the day's implementation, debugging, documentation/backlog updates and specific next-day planning as defined in DAILY_WORKFLOW.md. New discoveries need a priority, target day and testable acceptance condition.

## Day 00 foundation prepared
Next.js/TypeScript, Material UI visual system, responsive owner dashboard, product search/category/low-stock filters, add-item dialog, theme switch, PWA shell, MongoDB Prisma schema, .npmrc ignore rule, README and daily cycle are prepared. Dashboard records are illustrative.

## Daily work
### Day 00 validation
Nexus returned 404 for packages used by this project. Following the user's approval, dependencies were installed with npmjs fallback. The ignored local .npmrc preserves Nexus as default and contains only required scope overrides. Tests, lint, typecheck and production build passed; Day 01 has not started.

| Day | Focus | Acceptance |
|---|---|---|
| 01 | Baseline quality | Done — review foundation, check responsive/browser baseline, correct sample date, and restrict service-worker caching. Tests/lint/types/build pass. |
| 02 | Mongo data lifecycle | Done — validated the schema, pushed it to the dedicated loopback `sable_inventory_dev` replica set, and confirmed two repeat seeds preserve one linked four-unit product/receipt fixture worth 4800 cents. |
| 03 | Catalog reads | Done — local-only paginated catalog and product details, responsive loading/error/empty states; PR #6 merged to `main` at `5fb458564e932d29a1c3c859f5b3456794e3afe4`. |
| 04 | Product validation | Complete — PR #7 merged; normalize/uniquely check SKUs, parse non-negative USD amounts into integer cents, and accept bounded whole-unit quantities with field-level errors. The service-worker-owned-cache follow-up merged via PR #8 and closed Issue #5. |
| 05 | Create/edit products | Implementation and local acceptance complete; PR/panel delivery pending — persist products through local-only POST/PATCH routes, create opening receipts transactionally, protect SKU uniqueness at the database index, preserve on-hand quantity during edits, and expose created/updated timestamps. Staff authentication and stock movement editing stay on their scheduled days. |
| 06 | Search/filter | Make filters server-backed, composable and URL-shareable. |
| 07 | Stock movement domain | Add receipt, sale, return and adjustment movement rules. |
| 08 | Movement history | Show per-product ledger and global activity with pagination. |
| 09 | Atomic stock updates | Prevent stale or invalid stock changes; cover concurrency boundaries. |
| 10 | Reorder workflow | Configure thresholds and generate a reviewable purchase list. |
| 11 | Supplier records | Add supplier profiles, contacts and product associations. |
| 12 | Purchase orders | Create draft orders, line items and expected delivery dates. |
| 13 | Receiving | Record partial/full deliveries and update quantities from movement events. |
| 14 | Barcode workflow | Add barcode/SKU lookup and keyboard-friendly receiving flow. |
| 15 | Staff authentication | Add secure sign-in and protected stockroom routes. |
| 16 | Roles and audit | Scope permissions; record who changed quantities and why. |
| 17 | Locations | Support multiple shelves/locations with explicit transfer records. |
| 18 | Inventory count | Build count sessions, variance review and approved adjustments. |
| 19 | Sales integration | Add import boundary for sales; make duplicate imports idempotent. |
| 20 | Analytics charts | Show stock movement, sell-through and inventory value by period. |
| 21 | CSV/XLSX exports | Export filtered catalog, counts and movement ledger. |
| 22 | PDF reports | Produce branded stock valuation and reorder documents. |
| 23 | PWA completion | Validate install, offline read experience, cache safety and updates. |
| 24 | Mobile stockroom | Optimize scan/count/reorder flows for phone and tablet. |
| 25 | Accessibility | Review keyboard, screen readers, contrast, focus and data tables. |
| 26 | Reliability | Add structured errors, health/readiness and safe operational logs. |
| 27 | Security/data integrity | Review validation, authorization, backups and destructive actions. |
| 28 | Performance/SEO | Measure queries and bundle; improve metadata and loading states. |
| 29 | Release candidate | Full quality suite plus manual stock receipt/count/reorder review. |
| 30 | Release handoff | Finish deployment, database setup, staff guide, screenshots and release notes. |

## Discovery log
Move a task only with a reason and revised acceptance. Completion means UI, data rules, tests, docs and empty/error states agree.

- Review follow-up for Day 01 Issue #5: fixed service-worker activation to delete only older `sable-shell-*` caches, preserving unrelated Cache Storage entries; added a regression test for unrelated cache preservation and `clients.claim()`. The fix is delivered separately from the completed Day 04 PR; close Issue #5 only after its dedicated PR is merged.

- Day 01: Done. Browser baseline and route map are recorded in README. The fixture date was updated, and service-worker caching is restricted to the public offline shell and static assets; API and dynamic navigation responses are excluded. Day 02 is Prisma Mongo schema validation and a repeatable local setup/seed strategy.
- Day 02 acceptance completed 2026-11-01: MongoDB 7.0.16 on loopback `rs0` accepted the guarded schema push and two transactional seed runs; one synthetic product and linked four-unit opening receipt remain at 4800 cents. See DATABASE.md and DAILY-LOG.md. Next: deliver Day 03 catalog reads on a fresh branch from synchronized `main`, then Day 04 product validation.
- Day 03 completed 2026-11-01: PR #6 merged to `main` with merge commit `5fb458564e932d29a1c3c859f5b3456794e3afe4`; local `main` is synchronized. The local-only paginated catalog and product details remain behind the guarded loopback database; see the workspace receipt and DAILY-LOG.md.
- Day 04 implementation on `day-04/product-validation`: shared validation canonicalizes SKU, rejects duplicate sample/local-catalog SKUs, converts non-negative USD input to integer cents and enforces non-negative whole-unit quantities/reorder points. The preview form displays field-level errors; product data remains browser-session-only. The SKU-availability API is dev-only and never writes. Tests, lint, typecheck, build and browser acceptance are complete; PR/panel delivery is pending. Next: Day 05 persistent create/edit must recheck uniqueness during the write and handle the database unique-index race.

## Process change effective Day 02 — 2026-10-27

Apply [DELIVERY-POLICY.md](DELIVERY-POLICY.md) to every remaining ticket: finish Sable Ledger before the next repository, use meaningful scope-driven commits and deliver through its own reviewed PR. A blocked external gate needs a concrete record and next action. This adds delivery gates without moving Day 02–30 product work or changing completed history.

## Contribution integration — 2026-10-27

Effective Day 02: apply [CONTRIBUTING.md](CONTRIBUTING.md) inside existing tickets. At already scheduled weekly reviews, assess real feedback such as a synthetic movement/balance reconciliation case with units and integer-cent valuation; at documentation/setup tickets, improve a Mongo setup and inventory walkthrough without operational stock data. Day 30 records actual contribution evidence and outstanding external dependencies. No day is renumbered and no quota or badge is a completion criterion. Next scope remains: Day 02 — Prisma Mongo schema validation, repeatable local setup and safe synthetic seed strategy.

## Day 04 trigger — 2026-10-31 (blocked by Day 02)

The requested Day 04 run did not start product validation work because Day 02's live Mongo replica-set/schema-push/repeat-seed acceptance remains open, and Day 03 catalog reads are still ahead of Day 04 in the existing sequence. The recheck found no MongoDB tools or listener on port 27017 and no local `.env`; see DAILY-LOG.md and DATABASE.md. Keep the Day 03 and Day 04 scopes and numbering unchanged. Next: provide an isolated local `rs0`, run the guarded schema check/push and seed twice, complete the pending Day 03 catalog-read scope on its own manual trigger, then resume Day 04 when requested.

## Day 04 trigger resumed — 2026-11-01

The prior Day 04 blocker is historical: the Day 02 Mongo acceptance has now passed, but Day 03 catalog reads still precede product validation. Complete Day 03 through its own branch, PR and merge before starting Day 04. Preserve this schedule and Day 30 target.
