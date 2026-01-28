# Decisions

Running log of non-obvious engineering decisions and their reasoning.

## Loans feature (lending ledger) — v1

**Money stays `Decimal`, not `Int` paise.** Every existing money column
(`Transaction.amount`, `Account.balance`, `Budget.amount`) is Prisma `Decimal`
backed by Postgres `DECIMAL(65,30)` — exact at rest. Introducing an Int-paise
representation for just Loans would mean two money models in one small app, each
with its own `/100`↔`*100` conversion bugs, for no correctness gain. The real
risk Int-paise guards against — the overpayment check and the `SETTLED` equality
check going wrong under float rounding — is handled directly: those comparisons
run in Prisma `Decimal` space (`.minus()`, `.greaterThan()`,
`.greaterThanOrEqualTo()`) **before** any `.toNumber()`, so a chain of
repayments summing to exactly the principal lands on `SETTLED` instead of a
float-epsilon short. Verified with a `499.90 = 250.10 + 249.80` flow test.

**Status is derived and stored, `OVERDUE` is computed.** `OPEN` /
`PARTIALLY_REPAID` / `SETTLED` are maintained by `computeLoanStatus` on every
repayment write and stored for cheap filtering; never user-settable. `OVERDUE`
is **not** a column — it's computed at read time (`dueOn < now && status !==
SETTLED`) so it can never go stale and needs no cron.

**`repaidAmount` is a denormalized cache, recomputed transactionally.** Each
`createRepayment` inserts the row, re-aggregates `sum(amount)` from the
`Repayment` rows, and updates `repaidAmount` + `status` — all inside one
`db.$transaction`. Recompute-from-source (not `increment`) means the cache
self-heals against any drift. Mirrors how `Account.balance` is kept in step with
transactions elsewhere.

**Overpayment is rejected**, not capped-and-flagged, with an error naming the
remaining balance. Simpler mental model; a friend paying back more than owed is
a data-entry mistake worth surfacing, not silently absorbing.

**Server actions, no route handlers.** The repo uses route handlers only for the
Android device-token endpoints and the Inngest webhook. Nothing about Loans is
hit by an external client, so everything is a server action. Getters throw
(matching `getUserAccounts`/`getTransaction`); mutations return `{ success,
error }` (matching `actions/review.js`). `getPublicLoan` is the exception — it
returns `null` on a bad token and the page calls `notFound()`.

**Public ledger is a capability URL.** `Loan.publicToken` is 32 crypto-random
bytes, stored unhashed (like `PairingCode.code`, unlike `Device.tokenHash`) —
a leaked link only exposes figures both parties already know. `getPublicLoan`
returns a redacted shape: amounts, dates, status, repayment history, owner name,
and the one counterparty's name — no `userId`, no `publicToken`, no phone, no
notes, no other loans. Verified the served HTML leaks none of these.

**Nudge is a plain `<a target="_blank">`, logged fire-and-forget.** Never
`window.open` (popup blockers). No `sendBeacon` — it can't target a server
action, and it isn't needed anyway since the link opens a new tab and the
current tab never unloads. `logNudge` is called un-awaited in the same
`onClick`. Throttling is informational only ("Last nudged 2h ago"); the user's
own WhatsApp isn't ours to hard-block.

**Deleting a Counterparty with loans is blocked**, not cascaded (differs from
the `Account → Transaction` cascade). Silently erasing a debt record during a
contacts cleanup is the wrong default for a money app. Enforced by an app-level
pre-check (`loan.count`) returning a friendly error, backed by the DB's default
`RESTRICT` FK. A Loan itself can still be deleted (cascading its repayments),
with a confirm dialog when repayments exist.

**Loan ↔ Transaction linking deferred.** A Loan is a fully separate ledger in
v1 — it does not touch `Account.balance` or create a `Transaction`. Modeling
"lending moves money out of an account" (and whether repayment then creates
income, and how that avoids double-counting) is a real product decision not
worth rushing pre-deploy.

**Phone normalization is hand-rolled, India-only.** `lib/phone.js` handles the
formats that matter (`+91 98765-43210`, `9876543210`, `098765 43210`, `91…`) and
rejects non-Indian / malformed numbers, storing a canonical `+91XXXXXXXXXX`. No
`libphonenumber-js` dependency — the whole app is already India-only (₹, Indian
SMS parsing, no i18n). A bad number fails silently in `wa.me`, so it's validated
at write time rather than at click time.

**Migrations: `prisma db push`, not `migrate dev`.** The repo's migration
history is decorative — `prisma migrate status` shows all 8 files unapplied, and
introspection confirms the live DB was built entirely via `db push` (4 of the 8
current models have no migration file at all). Running `migrate dev` would try to
replay stale `CREATE TABLE`s against existing tables. The Loans schema is purely
additive (4 tables + 2 enums, no changes to existing tables), so `db push` is
safe and consistent with how everything else got there.

**Shared `formatMoney` helper.** Extracted `₹{x.toFixed(2)}` into
`lib/utils.js` — ~18 files already duplicated it inline and Loans added ~15 more
call sites. Guards NaN/null → `₹0.00`. Reduces the `$`-vs-`₹` class of bug found
earlier.

## Loans — review follow-ups

**Overdue is IST-aware, and "due today" is not overdue.** `isOverdue` (the single
copy in `lib/loan-display.js`) and the two server-side overdue queries
(`getLoanDashboardTiles`, `getOverdueLoanCount`) all compare `dueOn` against
`istStartOfToday()` — the start of the current day in IST (fixed UTC+5:30, India
has no DST), expressed as a UTC instant. A loan due today therefore only becomes
overdue tomorrow. A plain `dueOn < new Date()` (previous behaviour) marked a
loan overdue for the whole of its due day; a naive server-local start-of-day
wouldn't have fixed it either, because a due date is stored as *IST* midnight —
hence the explicit IST math. This is the one spot that does tz arithmetic; the
rest of the app's date boundaries remain server-local, which is acceptable
because loans are the only place a same-day boundary is user-visible.

**Repayments lock the loan row (`SELECT … FOR UPDATE`).** `createRepayment`
takes a row lock at the top of its transaction so concurrent writes serialize.
Without it, two racing repayments (realistically a double-submit) both read the
same `repaidAmount`, both pass the overpayment guard against the same stale
balance, and both insert — overpaying the loan. Raw SQL because Prisma's query
builder has no `FOR UPDATE`. The recompute-from-sum already kept `repaidAmount`
itself correct; the lock is what keeps the *overpayment guard* honest.

**Public ledger really shows no notes.** `getPublicLoan` now omits both the loan
`note` and per-repayment `note` (they were being returned and rendered, which
contradicted this file). Notes are free-text the owner may have written as
private memos, so they stay in the authed views only — the public page shows
amounts, dates, status, and repayment amounts/dates.

**Public share links require `NEXT_PUBLIC_APP_URL` in production.** `getBaseUrl`
throws in production if it's unset rather than falling back to the request's
`Host`/`X-Forwarded-Host` — a spoofed Host could otherwise put an
attacker-controlled origin into the ledger link a user sends to someone else.
The header fallback is dev-only. **Deploy note: set `NEXT_PUBLIC_APP_URL` to the
canonical origin (e.g. `https://payney.app`) or loan detail pages will 500.**

**Skipped (from review):** (1) *Recording the nudge as "sent" before delivery* —
`wa.me` deep links give no send/delivery callback, so a confirmed-send signal is
unobservable; the log records the user-initiated attempt, the UI says "nudged"
(not "sent"/"delivered"), and DECISIONS already frames it as informational. (2)
*Composite `(loanId, userId)` FK on Repayment/ReminderLog* — the denormalized
`userId` is only ever written from the loan owner in `createRepayment`/`logNudge`,
and the pattern matches the existing `Transaction`/`Account` denormalization
(which also has no composite FK). Not worth a migration pre-deploy.
