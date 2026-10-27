# Sable Ledger daily delivery cycle — effective Day 02

Follow [DELIVERY-POLICY.md](DELIVERY-POLICY.md). Finish this inventory repository before starting the next portfolio project; record any external blocker and exact next action first.

1. Read AGENTS.md, DELIVERY-POLICY.md, BACKLOG.md, README.md and DAILY-LOG.md. Inspect status/history and reconcile the previous PR; preserve user changes.
2. Confirm the manually requested day. Do not advance to a later day without its trigger. Fetch and create `day-NN/<inventory-scope>` from current `origin/main`.
3. Review prior SKU, quantity, integer-cent valuation and movement code, staff/workspace boundaries and safe caching. Reproduce relevant defects and check stale/concurrent update risks when movement logic changes.
4. Add meaningful domain/error regression cases, implement the scoped inventory item and debug affected list/detail/filter paths.
5. Run relevant tests, lint, typecheck and build. Inspect touched stock tables/dialogs for keyboard access, phone/tablet overflow and both themes. Record actual results for this repository.
6. Update product/setup/data documentation and BACKLOG.md with priority, acceptance, carry-over and the next day. Keep real catalog/supplier data, credentials and local config out of Git.
7. Choose coherent commits from actual stockroom changes; titles, content and count must reflect this product, without a common portfolio quota or fabricated splits.
8. Push this repository's branch and open its own PR to `main`. Review all files and the latest head in GitHub Files changed, Checks and conversation; resolve findings and recheck new commits.
9. Respect required checks and independent approvals. If permitted, merge from the GitHub panel and confirm Merged; fetch and fast-forward local `main` to `origin/main`, retain the pushed branch and verify a clean worktree.
10. Record the actual pre-merge state in DAILY-LOG.md and the final merge SHA/sync receipt in workspace DELIVERY-RECEIPTS.md; reconcile it in the next authorized update. Finish recording the receipt before proceeding to the next project.
