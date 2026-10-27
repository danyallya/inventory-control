# Daily work log

## Day 00 — foundation (2026-10-26, Asia/Tehran)

- Prepared the product-specific Next.js/TypeScript workspace, responsive interface, light/dark theme, React Icons, PWA shell, README, AGENTS.md and 30-day backlog.
- Review: inspected the starter page, tests, database schema/config, build, Git ignore rules and local registry setup; corrected issues found by checks before recording a passing result.
- Dependencies: generated package-lock.json and installed packages after Nexus 404s. The user approved npmjs fallback. Local .npmrc remains ignored, preserves Nexus as default and maps only required scopes. No private registry config is tracked.
- Checks: npm test passed (1/1), npm run lint passed, npm run typecheck passed, and npm run build passed. The production build emitted the PWA manifest/service-worker shell.
- Database setup: npm run db:generate generated Prisma Client from the local schema. No real database connection or data push was attempted.
- GitHub: Day 00 foundation commit 7d0f5a5 is pushed to both main and day-00-foundation: https://github.com/danyallya/inventory-control. Day 01 has not started.
- Schedule: Day 01 has not started. The next task is Day 01 in BACKLOG.md; wait for the user to trigger that day.

## Day 01 — baseline quality (2026-10-27, Asia/Tehran)

- Review: inspected the product dashboard, filters, add dialog, Prisma schema, health/offline routes, theme provider, service worker and prior tests. The worker cached every successful same-origin GET, which could include dynamic pages and future API responses. The preview date was one day behind the run date.
- Implementation: restricted PWA caching to the offline shell and public static assets; API calls bypass the worker and navigation stays network-only with an offline fallback. Cache version `sable-shell-v2` removes the previous broad cache. Updated the fixture date and stock movement endpoint label to Tuesday, 27 October 2026. Added cache-boundary and dashboard-render tests.
- Browser: checked the dashboard at about 727 CSS pixels wide; summary cards use two columns and the product table scrolls horizontally. Verified All/Needs attention filtering, light/dark mode and Add product dialog open/cancel. The dialog is still browser-local preview state.
- Checks: `npm test` passed (2 files, 4 tests); `npm run lint`, `npm run typecheck`, `npm run db:generate`, `npm run build`, and `git diff --check` passed. No MongoDB migration or real catalog data was used.
- GitHub: implementation/docs commit `320d7f6` (`fix: constrain inventory service-worker caching`) was pushed to `day-01/baseline-quality`, fast-forwarded to `main`, and `main` was pushed. This log entry will be included in the final sync.
- Next: Day 02 — validate the Prisma Mongo schema and document a repeatable local setup and safe sample seed strategy.

## Review workflow maintenance — 2026-10-27

- The user requested careful sequential project execution, commit content/counts suited to each product and an independent branch/PR per repository with panel review and merge.
- Sable Ledger review reconciles stock movements, quantities and integer-cent valuation, then checks staff authorization, ledger history and low-stock behavior against the same records. Added a standalone delivery policy and entry points in AGENTS, README and BACKLOG.
- Documentation-only maintenance on `docs/sable-stock-integrity`; Markdown diff reviewed and `git diff --check` used. No application tests/build rerun for this process change. Next product work: Day 02 — Prisma Mongo schema validation, repeatable local setup and safe synthetic seed strategy.
- This is the pre-merge log state. The portfolio workspace DELIVERY-RECEIPTS.md records the actual PR URL, checked head, panel gates, merge SHA and sync afterward; reconcile it here in the next authorized update.
- Updated DAILY_WORKFLOW.md with stock-domain review, manually requested days and the PR/panel-merge/sync completion gate; the workflow and policy form one coherent inventory-delivery update.
