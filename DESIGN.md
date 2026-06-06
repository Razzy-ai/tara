# Tara Agent — Design Document

## Schema

Four tables cover the entire domain.

**Transaction** — one row per bank/card line item.

| Column              | Type     | Notes                                              |
|---------------------|----------|----------------------------------------------------|
| id                  | String   | Primary key (from source data)                     |
| date                | DateTime | Transaction date                                   |
| merchant            | String   | Raw merchant string from source                    |
| normalizedMerchant  | String   | Canonical form after noise-token stripping         |
| category            | String   | Lowercase (food, travel, transfer, …)              |
| amount              | Float    | Positive = debit/spend; negative = credit/refund   |
| currency            | String   |                                                    |
| memo                | String?  | Optional free-text                                 |

Indexes: `date`, `merchant`, `normalizedMerchant`, `category` — covering every filter path in `buildWhere`.

**Fund** — one row per mutual fund.

| Column   | Type   | Notes               |
|----------|--------|---------------------|
| id       | String | Primary key         |
| name     | String | Display name        |
| category | String | Equity/Debt/Gold/…  |

**FundNav** — one NAV record per (fund, date). Unique constraint on `[fundId, date]` prevents duplicates on re-ingest. Indexes on `fundId` and `date` support the window-boundary queries.

**Holding** — one row per fund position held.

| Column       | Type     | Notes                          |
|--------------|----------|--------------------------------|
| id           | Int      | Autoincrement PK               |
| fundId       | String   | FK → Fund                      |
| units        | Float    | Units purchased                |
| purchaseDate | DateTime |                                |
| purchaseNav  | Float    | NAV at time of purchase        |

Index on `fundId`.

---

## Tool Design

The assignment rewards fewer, parameterized tools. Four tools cover every question type:

**`queryTransactions`** — all spending/income questions via a single `operation` discriminant:
- `netSpend` — `SUM(amount)` from `prisma.aggregate`, filtered by category/merchant/date. Transfers excluded unless explicitly requested.
- `topMerchants` — `prisma.groupBy(normalizedMerchant)` ordered by sum, configurable `limit`.
- `monthlyBreakdown` — full table scan into a JS Map, aggregated by `YYYY-MM` key. Optional category filter.
- `biggestExpense` — `findFirst` ordered by `amount desc`, transfers excluded.
- `listTransactions` — `findMany` with capped limit for sample rows (totals always from `aggregate`).
- `categoryComparison` — two sequential `getNetSpend` calls, returns both totals and delta.

**`queryFunds`** — NAV, period return, and fund ranking. Accepts optional `startDate`/`endDate` for windowed returns. Operation `fundReturn` queries the NAV nearest after startDate and nearest before endDate; `rankFunds` does the same for all funds and appends `spread` (best − worst return).

**`queryHoldings`** — portfolio-level and per-holding questions. `holdingReturn` resolves the holding by fund name (case-insensitive `contains`), then computes realised return. `portfolioValue` returns `totalCost`, `totalValue`, and `totalGain` (absolute INR). `bestHolding` returns the highest-return fund name.

**`recurringSubscriptions`** — detects repeating merchants: ≥3 positive-amount occurrences with a median inter-payment interval of 25–35 days.

The previous 7-tool split (`queryTopMerchants`, `queryMonthlySpend`, `queryBiggestExpense` as separate tools) was collapsed into one parameterized `queryTransactions` to avoid tool-selection confusion and overlapping descriptions.

---

## Grounding

Every number in an agent answer originates from a Prisma query against the PostgreSQL database. The agent instructions prohibit arithmetic in prose: "Never guess numbers" and "Only use values returned by tools." The model receives the raw tool output and formats it into a sentence; it never adds, subtracts, or rounds independently.

---

## Formulas

**Spend** — `SUM(amount)` for the filtered row set. Positive amounts are debits; negative amounts are refunds. Including negatives in the sum means refunds automatically reduce the spend total.

**Net spend (default behaviour)** — transfers excluded: `WHERE category != 'transfer'`. When the caller passes `filters.category`, the exclusion is omitted (a specific category filter already narrows the set).

**Merchant normalization** — applied at ingest time to populate `normalizedMerchant`:
1. Uppercase the raw string.
2. Replace `*`, `.`, `/`, `-` with spaces.
3. Split on whitespace; discard tokens in the `NOISE_TOKENS` set (generic suffixes: `ORDER`, `BOOKING`, `RIDE`, `PAYMENT`, `PVT`, `LTD`, `LIMITED`, `INDIA`, `IN`, `COM`, `SYSTEMS`, `TECHNOLOGIES`; common city names).
4. Rejoin remaining tokens.

**Merchant query-time matching** — `buildWhere` uses an OR: `normalizedMerchant ILIKE %filter%` OR `merchant ILIKE %filter%`. This catches variants like `SWIGGY INSTAMART` and `SWIGGY BANGALORE` under a single "Swiggy" query.

**Recurring detection** — a merchant is recurring if it has ≥3 positive-amount transactions with a median inter-payment interval between 25 and 35 days.

**Fund period return** — `(navEnd − navStart) / navStart × 100`, where `navStart` is the NAV on or nearest after `startDate` and `navEnd` is the NAV on or nearest before `endDate`. When no window is given, earliest and latest NAVs are used.

**Holding realised return** — `currentValue = units × latestNav`; `cost = units × purchaseNav`; `gain = currentValue − cost`; `returnPct = gain / cost × 100`.

---

## Relative-Date Assumption

"Today" is resolved to the maximum `date` present in the `Transaction` table (i.e. the most recent transaction date in the ingested snapshot). "Last month" and "March" are resolved by the agent by converting them to explicit `YYYY-MM-DD` bounds before calling a tool. The agent instructions show the expected format: `Q1 2025 = startDate:2025-01-01, endDate:2025-03-31`.

---

## Evals

`eval/runEval.ts` posts 12 questions to `http://localhost:3000/ask` against `sample_a`. Cases cover:

- Single lookup (biggest expense, portfolio value)
- Date-filtered spend (Q1 2025 total spend)
- Refunds reducing spend
- Merchant alias grouping (all Swiggy variants)
- Transfers explicitly excluded
- Category comparison (food vs. travel)
- Recurring subscriptions detection
- No-data (honest "no data" response)
- Fund period return (date-windowed)
- Fund ranking + spread
- Realised return on a named holding
- Portfolio aggregate (total gain in INR)

Run:
```bash
# Mac/Linux
DATA_DIR=./data/sample_a npx tsx scripts/ingest.ts
npm start &
sleep 3
npm run eval
kill %1

# Windows
set DATA_DIR=./data/sample_a
npx tsx scripts/ingest.ts
start /B npm start
timeout /t 3
npm run eval
```

Expected: ≥ 11/12 passing. Numeric assertions strip `₹`, commas, and spaces before comparing to 2 decimal places.

---

## Observability

Every `POST /ask` request writes one JSON line to `logs/app.log`:

```json
{
  "request_id": "<uuid>",
  "question": "<user question>",
  "tools": ["queryTransactions", "queryFunds"],
  "tool_inputs": [
    { "tool": "queryTransactions", "inputKeys": ["operation","filters"], "operation": "netSpend" }
  ],
  "tables_read": ["Transaction"],
  "latency_ms": 812,
  "status": "success"
}
```

`tool_inputs` records input **keys and operation**, never raw string values (which could contain user data). The API key is never logged. To inspect a failed run: `tail -n 1 logs/app.log | python3 -m json.tool`.

---

## Async Milestone

All tools execute synchronously within the agent's tool-call loop. There is no background job, queue, or async streaming pipeline. This was intentional — the dataset fits in memory, and the grading surface is a single synchronous `POST /ask`. Parallelism could be added via `Promise.all` across independent tool calls if latency becomes a concern.

---

## Model / Provider

The agent uses **OpenRouter** (`openai/gpt-oss-120b:free`) via `@ai-sdk/openai` with `compatibility: "compatible"` to target the chat/completions endpoint. The Google Gemini (`gemini-2.5-flash`) configuration is present in `taraAgent.ts` but commented out for reference; switching requires setting `GOOGLE_GENERATIVE_AI_API_KEY` and uncommenting that import.

---


## Deployment

**Deployed URL:** https://tara-finance-agent-3lfo.onrender.com

Hosted on **Render** (web service) + **Neon** (serverless Postgres).

Start command: `tsx src/index.ts`. The server reads `process.env.PORT` and binds to `0.0.0.0` so Render's port injection works.

**Known deployment limitations:**
- Render free tier cold start: first request after 15 min idle takes 30–60 seconds
- Neon free tier (0.5 GB) comfortably holds three snapshots of ~1,500 transactions each
- OpenRouter free model (`gpt-oss-120b`) may be rate-limited under heavy parallel testing — swap to a paid provider key for reliable grading
---

## Known Failure Modes

- **Abbreviation aliases** — `AMZ*ORDER` normalizes to `AMZ`, not `AMAZON`. A user asking "Amazon spending" gets no match. Fix: a learned token-expansion step (e.g. fuzzy-match `AMZ` → `AMAZON` based on co-occurrence) or a small domain-specific alias table seeded from the data (not hardcoded brands, but derived from the snapshot).
- **Multi-holding funds** — `getHoldingReturnByFundName` returns the first matching holding. If a user held the same fund twice at different purchase prices, only the first row is returned.
- **NAV gaps** — if a fund has no NAV within the requested date window, `getFundReturn` returns a structured error. The agent is instructed to surface that honestly rather than extrapolating.
- **City tokens in merchant names** — the noise-token list covers major Indian cities but not tier-2 cities. A merchant like `SWIGGY PATNA` normalizes to `SWIGGY PATNA` rather than `SWIGGY`. Adding more city tokens is a data-driven decision, not a hardcode.
