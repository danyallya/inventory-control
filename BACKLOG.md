# Sable Ledger | 30-day delivery plan

## Outcome and daily cycle
Deliver an operational inventory product for independent design retail: trusted catalog data, auditable movements, purchasing, staff roles, reports and a release guide. Every day includes code review of prior work, test writing/updating, the day's implementation, debugging, documentation/backlog updates and specific next-day planning as defined in DAILY_WORKFLOW.md. New discoveries need a priority, target day and testable acceptance condition.

## Day 00 foundation prepared
Next.js/TypeScript, Material UI visual system, responsive owner dashboard, product search/category/low-stock filters, add-item dialog, theme switch, PWA shell, MongoDB Prisma schema, .npmrc ignore rule, README and daily cycle are prepared. Dashboard records are illustrative.

## Daily work
| Day | Focus | Acceptance |
|---|---|---|
| 01 | Baseline quality | Review foundation; install through approved registry; lint, typecheck and build pass; record responsive baseline. |
| 02 | Mongo data lifecycle | Validate Prisma Mongo schema, local setup and safe sample seed strategy. |
| 03 | Catalog reads | Add paginated product list and details backed by Prisma. |
| 04 | Product validation | Add SKU uniqueness, money and quantity rules with clear errors. |
| 05 | Create/edit products | Persist catalog changes with accessible forms and audit timestamps. |
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