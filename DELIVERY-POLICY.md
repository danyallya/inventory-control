# Sable Ledger delivery and review policy

## Execution gate — effective Day 02

When the user requests a day across all twelve portfolio projects, process this repository in README order and finish it before starting the next. No simultaneous project implementation, checks or subagent work. Finish inspection, scope, debugging, checks, docs, commits, PR panel review, merge and local sync here. If an external gate blocks completion, log the exact blocker and next action before proceeding to the next independent project.

Read AGENTS.md, this policy, README.md, BACKLOG.md, DAILY-LOG.md and any local workflow before editing. Inspect status, branch, prior commits and the previous day's diff; fetch remote state and start a fresh `day-NN/<product-scope>` branch from up-to-date `origin/main`. Use a descriptive maintenance branch for work outside a daily backlog. Preserve user changes and the product's architecture and design. Evidence from another repository never substitutes for this one.

## Commits follow actual work

Choose commit count, boundaries, scope, title and body from this product's real changes. Use coherent, independently reviewable units; include the relevant tests and docs with the change when they belong together. Do not repeat a fixed implementation-plus-log pattern, common quota, generic messages or copied PR descriptions across the portfolio. Do not invent changes or split a coherent change solely to force different counts. Shared conventions such as a `fix:` prefix are fine; the description must explain this product's change. Never force-push or rewrite existing history.

## Repository-specific PR and panel review

1. Push this repository's branch and open its own PR to its own `main`; attach the URL to the Codex chat. A draft may start after a coherent commit. Complete the scope and update its product-specific title/body before final review.
2. Describe the concrete problem, resulting behavior, relevant checks and limitations. Review all changed files in GitHub Files changed, compare the final pushed head with the verified branch, inspect Checks and the conversation, and resolve findings. After any new commit, repeat affected checks and review the updated head.
3. Confirm the exact head's required checks and approvals. Record absent CI as absent; keep local evidence distinct. The user authorizes routine PR creation, panel review and merge when checks pass and GitHub permits it. The author cannot independently approve their own PR. Record a missing required reviewer as a blocker; do not bypass protection, change permissions or impersonate approval.
4. Merge through the GitHub panel after the gates pass. Prefer a merge commit when allowed to preserve meaningful commits. Record a product-specific reason for another configured method. Direct local merge plus pushing `main` is superseded.
5. Verify the panel shows Merged, fetch remote state and fast-forward local `main` to `origin/main`. Preserve the pushed day branch and confirm a clean worktree; branch and main hashes may differ because of a merge commit.

## Evidence and next-day handoff

Run checks relevant to actual behavior and record commands/outcomes honestly. Review the final diff and exclude secrets, local .npmrc/.env, private machine paths, generated outputs and unrelated files. Update affected docs and BACKLOG.md without shifting completed history or the Day 30 target.

Before merge, DAILY-LOG.md records only the actual current state: requested day, scope, review findings, checks, known commit IDs, branch, PR URL if known, publication status, blockers and next day. Record the final panel result, merge SHA and synchronization in the portfolio workspace DELIVERY-RECEIPTS.md after merge; reconcile it in the next authorized project log update. Do not add artificial follow-up commits merely to record a commit's own hash.

Historical Day 00/01 entries describe their original workflow. This policy supersedes older parallel-batch, fixed-commit-pattern and direct-main delivery instructions from Day 02 onward.

## Sable Ledger review priorities

- Reconcile stock balances with inbound/outbound movements, low-stock thresholds, integer-cent valuations and stock units; reject invalid quantities and check list/detail totals together.
- Review stock-filter feedback, product-dialog keyboard flow, responsive tables and both themes; distinguish synthetic inventory from persisted balances.
- Verify authorization, audit history and service-worker/API cache boundaries before real inventory changes. Do not publish customer, supplier or operational stock data.

## Commit judgement for this product

Movement arithmetic, threshold behavior and table interaction changes need their own descriptions and checks. Commit related invariants and regression cases together, splitting only complete independent work.

Next planned scope: Day 02 — Prisma Mongo schema validation, repeatable local setup and safe synthetic seed strategy.
