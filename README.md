# Sable Ledger

Sable Ledger is an inventory and purchasing workspace for independent home, design and lifestyle retailers. It brings product records, stock movement and reorder signals into one composed stockroom view.

## Product direction

The owner dashboard is designed for a small retail team reviewing the floor before opening: product availability, stock value, movement and items below their reorder point. This foundation release includes a responsive MUI dashboard, product search and filters, theme control, add-product dialog, PWA shell and MongoDB data models. The visible figures are sample presentation records until connected to production APIs.

## Technology and local setup

Next.js App Router, TypeScript, Material UI, React Icons and Prisma with MongoDB. Recharts, jsPDF and SheetJS are included for the planned analytics and report exports.

Use Node.js 20 or newer and a MongoDB instance configured for Prisma. Copy .env.example to .env, set DATABASE_URL, then run npm install, npm run db:generate, npm run db:push and npm run dev. Before a delivery, run npm run lint, npm run typecheck and npm run build.

The local .npmrc points to the requested Nexus mirror and machine certificate. It is excluded from Git so internal registry details remain local. Configure the approved registry on your machine before installing.

## Data and operating model

Products retain SKU, collection, retail and unit cost in integer cents, on-hand quantity and reorder point. Stock movements provide the foundation for receiving, sales, returns and adjustments. Production use still needs authenticated staff roles, audited adjustments, backups, validation and deployment secrets. Do not commit real catalog or supplier data.

See BACKLOG.md for the 30-day product plan and DAILY_WORKFLOW.md for the recurring code review, tests, implementation, docs, debugging and next-day handoff.