# Sable Ledger

Sable Ledger is an inventory and purchasing workspace for independent home, design and lifestyle retailers. It brings product records, stock movement and reorder signals into one composed stockroom view.

## Product direction

The owner dashboard is designed for a small retail team reviewing the floor before opening: product availability, stock value, movement and items below their reorder point. This foundation release includes a responsive MUI dashboard, product search and filters, theme control, add-product dialog, PWA shell and MongoDB data models. The visible figures are sample presentation records until connected to production APIs.

## Technology and local setup

Next.js App Router, TypeScript, Material UI, React Icons and Prisma with MongoDB. Recharts, jsPDF and SheetJS are included for the planned analytics and report exports.

Use Node.js 20.12+ and a local MongoDB replica set configured for Prisma. Follow [DATABASE.md](DATABASE.md) for dedicated `sable_inventory_dev`, validation, guarded schema push and synthetic opening-stock fixtures. No SQL migration workflow applies to Mongo. Before delivery run tests, lint, typecheck and build.

The project-local `.npmrc` is intentionally ignored by Git because registry configuration is machine-specific. Run `npm ci` with your configured registry. If the configured mirror does not provide a dependency, npmjs is an approved fallback for dependency installation.

## Data and operating model

Products retain a canonical uppercase SKU, collection, retail and unit cost in integer cents, on-hand quantity and reorder point. Day 05 adds local-development-only create and edit operations. The create form persists validated data and records a nonzero opening quantity as a receipt in the same Mongo transaction; the unique SKU index remains authoritative for concurrent writes. Product details show creation/update timestamps. Edit can change identity, collection, retail price and reorder threshold while preserving on-hand stock; stock changes require the later movement workflow. Production use still needs authenticated staff roles, audited adjustments, backups, validation and deployment secrets. Do not commit real catalog or supplier data.

See BACKLOG.md for the 30-day product plan and DAILY_WORKFLOW.md for the recurring code review, tests, implementation, docs, debugging and next-day handoff.

## Day 01 baseline and route map

- The overview is `/`; `GET /api/health` reports service status and `/offline` is the static offline fallback. The local-only `/catalog` reads paginated products from `GET /api/products`, details from `GET /api/products/[id]`, creates through `POST /api/products`, and updates through `PATCH /api/products/[id]`. `GET /api/products/sku-availability?sku=...` remains a read-only availability helper. Catalog and write routes return 404 outside `next dev` or when `DATABASE_URL` is not the guarded loopback `sable_inventory_dev`/`rs0` target.
- The overview's summary cards, movement chart and six inventory rows remain illustrative. Add product submits validated values to `POST /api/products`; on success it opens the saved local catalog. Product details offer an edit form backed by `PATCH /api/products/[id]`. Both writes require `next dev`, the guarded loopback `sable_inventory_dev`/`rs0` database and a loopback request host/origin, and return private no-store responses. The unique index maps concurrent duplicate SKUs to a field-level conflict. Product create/update timestamps are stored by Prisma and shown in the detail panel. Create records any opening quantity as an initial receipt in one replica-set transaction. Edit does not change on-hand quantity or unit cost. Catalog reads omit unit cost and show only unarchived records. The write APIs are not production-safe until staff authentication and authorization ship.
- Browser baseline: at about 727 CSS pixels wide, summary cards use a two-column layout and the inventory table scrolls horizontally. Checked the All/Needs attention filter, Add product dialog open/close and light/dark theme. The displayed fixture date was one day behind the run date and now reads Tuesday, 27 October 2026.
- PWA cache boundary: the service worker pre-caches only `/offline`, the manifest and icon; it caches only `/_next/static/` assets and those public metadata files. API requests bypass the worker and navigation stays network-only with the offline page as fallback. Activation removes older `sable-shell-*` caches only and preserves cache names owned by other apps on the same origin.
- Verification uses Vitest, ESLint, strict TypeScript, Next.js production build and Prisma Client generation. Day 01 passed `npm test` (2 files, 4 tests), `npm run lint`, `npm run typecheck`, `npm run db:generate` and `npm run build`. No MongoDB migration or real catalog data was used.

## Delivery and review

Sable Ledger review reconciles stock movements, quantities and integer-cent valuation, then checks staff authorization, ledger history and low-stock behavior against the same records. Follow [DELIVERY-POLICY.md](DELIVERY-POLICY.md) from Day 02 for sequential execution, scope-driven commits and this repository's separate branch/PR with GitHub panel review and merge.

## Contributions and examples

See [CONTRIBUTING.md](CONTRIBUTING.md) for reproducible reports, genuine collaboration and product examples such as a Mongo setup and inventory walkthrough without operational stock data. Contributions follow the product backlog and reviewed PR workflow.
