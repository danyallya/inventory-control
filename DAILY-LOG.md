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

## Contribution guidance maintenance — 2026-10-27

- User request: integrate achievable GitHub profile goals naturally into future project work. Added Sable Ledger contribution guidance around a synthetic movement/balance reconciliation case with units and integer-cent valuation and useful documentation examples. Preserved the daily backlog and all delivery gates.
- Previous delivery-policy PR #1 is merged in origin/main; this maintenance starts from that merged history. No badge, collaborator, star or accepted answer is claimed.
- Documentation-only scope on docs/sable-stock-examples; reviewed Markdown and git diff --check. App tests/build are not rerun because runtime behavior is unchanged.
- External blocker: local browser use is disabled in Work settings. PR creation, panel review and merge remain pending; resume from this branch when browser access is available, inspect existing PRs first, target main and follow all gates.
- Publication is pre-merge here; the final PR/head/panel/check/merge/sync evidence goes in the workspace DELIVERY-RECEIPTS.md after completion. Next: Day 02 — Prisma Mongo schema validation, repeatable local setup and safe synthetic seed strategy. Wait for the user's day trigger.

## Day 02 — Mongo local lifecycle — 2026-10-28

- Reconciled merged policy/contribution PRs #1/#2 at main c0e15e3. Reviewed Mongo ObjectIds, unique SKU, product/time index, server-only client and prior cache tests. Documented that Prisma Mongo uses schema push and replica-set transactions rather than SQL migrations.
- Added guarded local check/push/seed commands for loopback sable_inventory_dev on rs0, without reset/data-loss flags. Synthetic product and opening RECEIPT share stable ObjectIds and four units; opening cost is 4800 integer cents. Transactional upserts preserve matching existing records. DATABASE.md defines service initialization, repeat-seed acceptance and recovery boundaries; no dependency versions changed.
- Prisma validate/generate passed. Six tests, lint and explicit typecheck passed; final production build recorded in workspace receipt. Installed Prisma CLI entry resolution passed. Reviewed all nine changed files before this log; private .env/.npmrc and output excluded. Shareable .env.example uses only loopback fixture settings.
- External DB blocker: no MongoDB binaries/service/listener on 27017. Explicit guarded db:check exited 1 with safe failure text. No live push, replica-set transaction or twice-run seed success is claimed. Start a local rs0 service, run check/push and seed twice to verify counts/reconciliation.
- GitHub follow-up: existing PR [#4](https://github.com/danyallya/inventory-control/pull/4) targets `main` from `day-02/sable-mongo-seed-contract`, head `5e007778dbb37480f8d6500223362acb1cb719b6`. All 10 Files changed entries were reviewed; Checks showed 0 configured runs and no base conflict. Author review [5679338412](https://github.com/danyallya/inventory-control/pull/4#pullrequestreview-5679338412) is COMMENTED, not independent approval. The PR remains Draft until a real local replica-set push and twice-run seed pass. Day 01 retrospective review [206996230](https://github.com/danyallya/inventory-control/commit/320d7f601463ad84cbb9ce83e42325c9ec412648#commitcomment-206996230) now records the origin-wide cache cleanup finding, tracked in [Issue #5](https://github.com/danyallya/inventory-control/issues/5); [Issue #3](https://github.com/danyallya/inventory-control/issues/3) tracks the pre-write stock/ledger invariant. No production stock, cache loss, CI or independent approval is claimed.
- Next: start/verify an isolated local rs0, run the guarded schema check/push and seed twice, then finish the PR gate; Day 03 paginated catalog reads/details remain on their manual trigger.
- Final seed-boundary review additionally requires directConnection=true, preventing replica-set discovery from expanding the connection beyond the explicit loopback target. Full tests/lint rerun after this script-only correction; no application bundle imports the development script.

## Day 04 — product validation — 2026-10-31 (blocked)

- Review: re-read the Day 02 Mongo guard, schema and synthetic seed contract, plus the Day 03 catalog-read and Day 04 validation acceptance. The prior implementation keeps writes scoped to loopback `sable_inventory_dev`/`rs0`; Day 04 also depends on the still-pending Day 02 database acceptance, and Day 03 remains ahead of it in the backlog.
- Blocker: `mongod`, `mongosh` and `mongo` were unavailable, no listener was present on port 27017, and `.env` was absent. `npm run db:check` exited 1 with “Set a loopback MongoDB development URL.” No live schema push, replica-set transaction or repeat-seed acceptance is claimed. The existing PR [#4](https://github.com/danyallya/inventory-control/pull/4) remains Draft on `day-02/sable-mongo-seed-contract`; no Day 04 feature branch or duplicate PR was created.
- Checks on the current branch: `npm test` passed (3 files, 6 tests), `npm run lint` passed, `npm run typecheck` passed, `npm run db:generate` passed, and `npm run build` passed. `npm run db:validate` exited 1 because `DATABASE_URL` is unavailable. These local checks do not substitute for live Mongo acceptance.
- Contribution fit: no new contribution issue or collaboration was warranted while the database gate is unavailable; the existing synthetic movement/balance example remains in scope for its planned work.
- Next: start an isolated MongoDB replica set `rs0` on loopback, configure the ignored `.env` for `sable_inventory_dev`, run guarded check/push and seed twice, then complete Day 03 catalog reads before resuming Day 04 on a later manual trigger. Preserve PR #4 and review its updated pushed head before ending this run.
