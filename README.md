<div align="center">

# 💸 PayNey

### Your money, on autopilot.

**PayNey is an AI-powered personal finance platform for India that reads your bank SMS and UPI notifications, scans your receipts, tracks your budgets, manages loans between friends, and emails you a plain-language monthly report — so you never have to type a transaction again.**

Built with Next.js 15 · React 19 · Prisma · PostgreSQL · Google Gemini · Inngest · Clerk

_Comes with a companion **PayNey Capture** Android app that turns your phone into an automatic transaction feed._

</div>

---

## ✨ Why PayNey?

Most expense trackers die the moment manual entry becomes a chore. PayNey removes the chore entirely.

Your bank already texts you every time money moves. Your UPI app already buzzes when someone pays you. PayNey listens to those signals through its Android companion app, parses them with a hybrid regex + LLM engine, de-duplicates them, auto-categorizes them, and drops them into a **Review queue** you clear in seconds. What's left is a clean, categorized ledger — plus budgets, analytics, a lending tracker, and an AI-written monthly summary of where your money actually went.

---

## 🚀 Features

### 🤖 Automatic Transaction Capture
- **Reads bank SMS & UPI app notifications** via the PayNey Capture Android app — no manual entry.
- **Hybrid parsing engine** — a fast, deterministic regex pass handles the common Indian bank/UPI formats (amounts, credit/debit direction, UPI Ref/UTR/RRN, VPA counterparties, day-first dates), and falls back to **Google Gemini** only when the text is ambiguous.
- **Smart edge-case handling** — understands quirks like _"John paid **you** ₹2"_ (money received, not spent) and day-first Indian date formats (`05-07-26` → 5 July).
- **Reference-number de-duplication** — the same transaction arriving from both an SMS and a notification collapses into one entry using UPI UTR/RRN plus an amount + time window.

### 🧾 Smart Receipt Scanner
- Snap a photo of any receipt and Gemini extracts the **amount, merchant, date, and best-fit category** automatically.
- Extracted fields pre-fill the Add Transaction form for a one-tap confirm — nothing is saved until you approve it.

### ✅ Review Queue
- Everything captured automatically lands here first. **Approve, edit, or discard** — you're always in control.
- Category suggestions learn from your history via a per-user merchant → category map.
- Raw SMS/notification text is treated as short-lived and **automatically wiped** once a row is resolved.

### 📊 Dashboards & Analytics
- Multi-account overview, spend heatmap, top categories, recent & recurring transactions, and cash-flow charts.
- Filter, search, and slice transactions by account, date range, and month.

### 💰 Budgets
- Set a monthly budget and track progress in real time.
- Automated **budget alerts** email you when you cross 80% of your limit (once per month, per default account).

### 🔁 Recurring Transactions
- Mark any transaction as recurring (daily/weekly/monthly/yearly). PayNey schedules and posts future occurrences on their due dates — drift-free, with missed periods collapsed safely.

### 🤝 Lending Ledger
- Track money you **lend or borrow** from friends and family as a separate, exact-decimal ledger.
- **Share a public read-only link** (a crypto-random capability URL) so the other person can see the balance and repayment history — no login, no private notes leaked.
- **Nudge on WhatsApp** with one tap when a repayment is due.
- Overpayment protection, row-level locking against double-submits, IST-aware overdue logic, and self-healing repayment totals. (See [`DECISIONS.md`](./DECISIONS.md) for the full engineering rationale.)

### 📧 AI Monthly Report
- On the first of every month, PayNey generates a **plain-language, Gemini-written breakdown** of the previous month's spending — where it went and where to cut back — and emails it to you via a polished React Email template.

### 🔒 Security
- **Clerk** authentication for the web app.
- **Device-token auth** for the Android app — paired via a short-lived pairing code, tokens stored only as HMAC hashes (never in plaintext), individually revocable.
- **Arcjet** rate limiting.
- Exact **decimal money math** everywhere (no floating-point rounding bugs), parameterized queries, and per-user scoping on every data access.

---

## 📱 PayNey Capture (Companion Android App)

The web app is the brain; the Android app is the senses. **PayNey Capture** is what makes the "never type a transaction again" promise real.

**What it does**
- 📩 Reads incoming **bank SMS** and **UPI payment-app notifications** and forwards the raw text to PayNey's ingest endpoint.
- 📷 **Scans receipt photos** and sends them to the receipt endpoint for AI extraction.
- 📴 **Offline outbox** — captures are queued on-device and synced when connectivity returns, preserving the real capture timestamp so transactions are dated when they actually happened.

**How pairing works**
1. In the web app, go to **Settings → Connect** and generate a pairing code (valid ~10 minutes).
2. Enter or scan the code in the Capture app.
3. The app exchanges the code for a **device token** (returned exactly once). The web server stores only an HMAC hash of it.
4. From then on, every capture is authenticated with `Authorization: Bearer <device-token>` — no Clerk session needed on the phone.

**Device management**
- Every paired device shows its label and last-seen time, and can be **revoked** at any time from the web app.

> **Note:** This repository contains the **PayNey web platform**. The Android app is a separate companion project that talks to the API endpoints documented below.

---

## 🔌 Capture API

The endpoints the Android app talks to. All accept **either** a Clerk web session **or** a device Bearer token, resolved by [`lib/auth/resolve-request-user.js`](./lib/auth/resolve-request-user.js).

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| `POST` | `/api/device/pair-code` | (Web) Generate a short-lived pairing code |
| `POST` | `/api/device/pair` | (Phone) Exchange a pairing code for a device token |
| `POST` | `/api/transactions/ingest` | Ingest a raw SMS / notification → parsed `PendingTransaction` |
| `POST` | `/api/transactions/receipt` | Extract fields from a receipt image (stateless) |
| `POST` | `/api/transactions/receipt/confirm` | Confirm a scanned receipt into a transaction |
| `PUT`  | `/api/inngest` | Inngest background-job webhook |

**Example: ingesting a captured SMS**

```http
POST /api/transactions/ingest
Authorization: Bearer <device-token>
Content-Type: application/json

{
  "sourceChannel": "sms",
  "rawText": "Rs.499.00 debited from A/c XX1234 on 05-07-26 to SWIGGY UPI Ref 402312345678",
  "timestamp": "2026-07-05T13:24:00.000Z"
}
```

The server parses it, de-duplicates against recent transactions, auto-categorizes it, and returns a `PendingTransaction` for the user to review.

---

## 🏗️ Tech Stack

| Layer | Technology |
| ----- | ---------- |
| **Framework** | Next.js 15 (App Router, Turbopack) · React 19 |
| **Language** | JavaScript (JSX) |
| **Database** | PostgreSQL via Prisma ORM |
| **Auth** | Clerk (web) · HMAC device tokens (Android) |
| **AI** | Google Gemini (`@google/generative-ai`) — parsing, receipt OCR, categorization, monthly insights |
| **Background Jobs** | Inngest (recurring transactions, monthly reports, budget alerts, cleanup) |
| **Email** | Resend + React Email |
| **Rate Limiting** | Arcjet |
| **UI** | Tailwind CSS · Radix UI · shadcn/ui · lucide-react · Recharts · Vaul · Sonner |
| **Forms & Validation** | React Hook Form · Zod |

---

## ⚙️ Background Jobs (Inngest)

PayNey runs four scheduled functions defined in [`lib/inngest/function.js`](./lib/inngest/function.js):

| Job | Schedule | What it does |
| --- | -------- | ------------ |
| **Process Recurring Transactions** | On demand (throttled 10/min per user) | Posts a recurring transaction's next occurrence and advances its schedule |
| **Trigger Recurring Transactions** | Daily @ midnight | Finds due recurring transactions and fans out processing events |
| **Generate Monthly Reports** | 1st of each month | Builds AI insights and emails each user their monthly report |
| **Check Budget Alerts** | Every 6 hours | Emails a warning when spend crosses 80% of budget |
| **Cleanup Resolved Pending Transactions** | Daily @ 00:30 | Wipes raw SMS/notification text off confirmed/discarded rows |

---

## 🧠 How It Works

```
┌─────────────────────┐        Bearer device token         ┌──────────────────────┐
│  PayNey Capture app  │ ─────────────────────────────────▶ │   /api/transactions   │
│  (Android)           │   raw SMS / notification / receipt  │   ingest · receipt    │
└─────────────────────┘                                     └──────────┬───────────┘
        │  offline outbox, real capture timestamps                      │
        ▼                                                               ▼
   pairing code ◀── Settings → Connect                    parse (regex → Gemini fallback)
                                                                        │
                                                            de-dupe ── categorize
                                                                        │
                                                                        ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│  Web app (Next.js) — Review queue → Transactions → Dashboards → Budgets → Loans    │
│  Clerk auth · Prisma/Postgres · Inngest jobs · Gemini insights · Resend emails      │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- A PostgreSQL database
- Accounts/keys for Clerk, Google Gemini, Resend, Arcjet, and Inngest

### 1. Clone & install

```bash
git clone https://github.com/othzer/PayNey.git
cd PayNey
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Google Gemini
GEMINI_API_KEY="..."
GEMINI_MODEL="gemini-2.5-flash"   # optional override

# Email (Resend)
RESEND_API_KEY="..."

# Security
ARCJET_KEY="..."

# Public origin — REQUIRED in production for loan share links
NEXT_PUBLIC_APP_URL="https://payney.app"

# Optional — download URL surfaced on the Connect page
CAPTURE_APK_URL="https://..."
```

### 3. Set up the database

```bash
npx prisma generate
npx prisma db push
```

> This project uses `prisma db push` (not `migrate dev`) — see [`DECISIONS.md`](./DECISIONS.md) for why.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To develop email templates locally:

```bash
npm run email
```

---

## 📁 Project Structure

```
app/
  (auth)/              # Clerk sign-in / sign-up
  (main)/
    dashboard/         # Overview, heatmap, top categories, recurring
    transactions/      # Full transaction list with filters
    transaction/       # Create + receipt scanner
    accounts/          # Multi-account management
    review/            # Approve/edit captured transactions
    summary/           # AI monthly summary
    loans/             # Lending ledger (+ counterparties, repayments, nudges)
    connect/           # Pair the Android Capture app
  l/[publicToken]/     # Public read-only loan ledger
  api/
    device/            # Pairing code + device token endpoints
    transactions/      # ingest · receipt · confirm
    inngest/           # Background-job webhook
actions/               # Server actions (accounts, transactions, loans, review, AI…)
lib/
  transaction-capture/ # parse · dedupe · categorize
  auth/                # device-token + request-user resolution
  inngest/             # scheduled functions
  gemini.js            # Gemini client
prisma/schema.prisma   # Data model
DECISIONS.md           # Engineering decision log
```

---

## 📝 Engineering Notes

PayNey keeps a running log of non-obvious engineering decisions in [`DECISIONS.md`](./DECISIONS.md) — including exact decimal money handling, derived-vs-stored loan status, IST-aware overdue logic, capability-URL security for public ledgers, and the hybrid parse strategy. It's a great read if you want to understand the _why_ behind the code.

---

<div align="center">

Made with care for people who'd rather live their lives than log their lattes.

</div>
