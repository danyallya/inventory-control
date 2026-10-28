# Sable MongoDB development lifecycle

Use Node.js 20.12+ and MongoDB 7+ with a replica set. Prisma's Mongo nested writes/transactions require replica-set support; a standalone daemon is not enough. This product uses `db push`, not Prisma Migrate SQL history.

## Repeatable local setup

1. Start a dedicated loopback MongoDB with replica set `rs0`. A local example is `mongod --replSet rs0 --bind_ip 127.0.0.1 --port 27017 --dbpath <your-disposable-local-data-folder>`. Create/choose the folder yourself; never reuse an unknown data directory. Keep it outside tracked source.
2. Use `mongosh` locally to initialize the replica set once, for example `rs.initiate({_id:'rs0',members:[{_id:0,host:'127.0.0.1:27017'}]})`. Wait for primary readiness; don't reinitialize an existing configured set. Do not expose an unauthenticated daemon to the network.
3. Copy `.env.example` to ignored `.env`. Use loopback database `sable_inventory_dev`, `replicaSet=rs0`, `directConnection=true` and a finite server-selection timeout. Credentials, if configured, stay local.
4. Run `npm ci`, `npm run db:validate`, `npm run db:generate`, `npm run db:check`, then `npm run db:push`. The push wrapper refuses another host/database/replica set and never adds accept-data-loss or force-reset flags. Inspect any schema/index warnings instead of bypassing them.
5. Run `npm run db:seed` twice. It transactionally upserts one fictional SKU and its four-unit opening RECEIPT with stable ObjectIds; existing records are preserved. Confirm one product/receipt remains and opening cost valuation is 4800 cents. Do not run against operational stock.

## Schema, indexes and recovery

Product SKU is unique; movement history is indexed by product/time. Prices/costs use integer cents and quantity uses whole units. The setup fixture reconciles movement quantity to opening balance; full movement validation, negative-stock policy and atomic concurrency are scheduled later. The dashboard remains synthetic session preview; setup does not connect it to persisted records.

Keep schema changes reviewed in Git and document data/backfill effects because Mongo has no SQL migration history here. Back up useful local data before changing unique indexes. A failed seed transaction should roll back both fixtures; repeat only after fixing service/schema conditions. No reset/drop/delete script is supplied. Use a new disposable database/data folder only after explicitly deciding which existing data may be discarded; never erase a production or unrelated database. Remote account, cluster and permission changes are outside this day.

## Observed validation — 2026-10-28

No Mongo binaries/service or listener on 27017 were found. Schema/client validation and synthetic guard/valuation tests can run independently; actual schema push, replica-set transaction behavior and repeat-seed verification remain blocked until a local rs0 service exists. A ping check against the explicit development target is recorded in DAILY-LOG.md. PR #4 was reviewed in the GitHub panel on Day 02 head `5e007778dbb37480f8d6500223362acb1cb719b6`; all 10 changed files were marked Viewed, Checks showed 0 configured runs, and no base conflicts were reported. The PR remains Draft pending live database acceptance.
