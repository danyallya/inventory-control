# Sable Ledger

Sable Ledger is an inventory and purchasing workspace for independent home, design and lifestyle retailers. It brings product records, stock movement and reorder signals into one composed stockroom view.

## Product direction

The owner dashboard is designed for a small retail team reviewing the floor before opening: product availability, stock value, movement and items below their reorder point. This foundation release includes a responsive MUI dashboard, product search and filters, theme control, add-product dialog, PWA shell and MongoDB data models. The visible figures are sample presentation records until connected to production APIs.

## Technology and local setup

Next.js App Router, TypeScript, Material UI, React Icons and Prisma with MongoDB. Recharts, jsPDF and SheetJS are included for the planned analytics and report exports.

Use Node.js 20 or newer and a MongoDB instance configured for Prisma. Copy .env.example to .env, set DATABASE_URL, then run npm ci, npm run db:generate, npm run db:push and npm run dev. Before a delivery, run npm run lint, npm run typecheck and npm run build.

The project-local `.npmrc` is intentionally ignored by Git because registry configuration is machine-specific. Run `npm ci` with your configured registry. If the configured mirror does not provide a dependency, npmjs is an approved fallback for dependency installation.

## Data and operating model

Products retain SKU, collection, retail and unit cost in integer cents, on-hand quantity and reorder point. Stock movements provide the foundation for receiving, sales, returns and adjustments. Production use still needs authenticated staff roles, audited adjustments, backups, validation and deployment secrets. Do not commit real catalog or supplier data.

See BACKLOG.md for the 30-day product plan and DAILY_WORKFLOW.md for the recurring code review, tests, implementation, docs, debugging and next-day handoff.

## Day 01 baseline and route map

- The current workspace preview is `/`; the existing operational route is `GET /api/health`, and `/offline` is the static offline fallback. Product, movement, supplier and order APIs are not implemented yet.
- Product rows, stock figures and charts are illustrative records. The Add product dialog updates only the current browser session; it does not write to MongoDB.
- Browser baseline: at about 727 CSS pixels wide, summary cards use a two-column layout and the inventory table scrolls horizontally. Checked the All/Needs attention filter, Add product dialog open/close and light/dark theme. The displayed fixture date was one day behind the run date and now reads Tuesday, 27 October 2026.
- PWA cache boundary: the service worker pre-caches only `/offline`, the manifest and icon; it caches only `/_next/static/` assets and those public metadata files. API requests bypass the worker and navigation stays network-only with the offline page as fallback. Cache version `sable-shell-v2` clears the previous broad cache on activation.
- Verification uses Vitest, ESLint, strict TypeScript, Next.js production build and Prisma Client generation. Day 01 passed `npm test` (2 files, 4 tests), `npm run lint`, `npm run typecheck`, `npm run db:generate` and `npm run build`. No MongoDB migration or real catalog data was used.
