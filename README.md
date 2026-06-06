# Tara

Tara is a finance-research agent that answers natural-language questions about your transactions, mutual fund holdings, and portfolio performance. It exposes a single HTTP endpoint — `POST /ask` — backed by a PostgreSQL database and a tool-calling LLM agent.

---

## Requirements

- Node.js 20+
- PostgreSQL 15+

---

## Install

```bash
npm install
npx prisma generate
```

---

## Postgres Setup

**Local Docker (quickest):**

```bash
docker run --name tara-pg \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=tara \
  -p 5432:5432 \
  -d postgres:16
```

`DATABASE_URL` for this setup: `postgresql://postgres:postgres@localhost:5432/tara`

---

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tara
GOOGLE_GENERATIVE_AI_API_KEY=<your-google-ai-studio-key>
OPENROUTER_API_KEY=<your-openrouter-key>
PORT=3000
```

Run migrations:

```bash
npx prisma migrate deploy
```

---

## Ingest Data

```bash
# Mac/Linux
DATA_DIR=./data/sample_a npx tsx scripts/ingest.ts

# Windows
set DATA_DIR=./data/sample_a && npx tsx scripts/ingest.ts
```

Replace `sample_a` with `sample_b` or `sample_c` for other snapshots. The ingest script is idempotent — re-running it on the same snapshot is safe.

---

## Run

```bash
npm start
```

The server listens on `http://localhost:3000` (or `$PORT` if set).

Development mode (auto-reload):

```bash
npm run dev
```

---

## POST /ask

**Request:**

```bash
curl -X POST http://localhost:3000/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What was my biggest single expense?"}'
```

**Response:**

```json
{
  "answer": "Your biggest single expense was ₹12,450 at HDFC LIFE INSURANCE on 2025-02-14."
}
```

---

## Eval

Run the evaluation suite against `sample_a` (server must be running):

```bash
DATA_DIR=./data/sample_a npx tsx scripts/ingest.ts
npm start &
sleep 3
npm run eval
kill %1
```

Prints a `Passed: X/12` / `Failed: Y/12` summary. Target: ≥ 11/12.

---

## Model / Provider

The agent uses **OpenRouter** (`openai/gpt-oss-120b:free`) by default. Google Gemini (`gemini-2.5-flash`) support is present in `src/agents/taraAgent.ts` and can be enabled by setting `GOOGLE_GENERATIVE_AI_API_KEY` and switching the commented import.

---

## Deployed URL

https://tara-finance-agent-3lfo.onrender.com

POST /ask endpoint is live and backed by Neon Postgres.

> **Note:** First request may take 30–60 seconds due to Render free tier cold start.
---

## Known Limitations

- Abbreviation aliases (`AMZ` → Amazon) are not resolved — normalization strips noise tokens but does not expand abbreviations.
- `getHoldingReturnByFundName` returns the first matching holding; duplicate positions in the same fund are not summed.
- City names not in the built-in noise list (e.g. smaller tier-2 cities) remain in normalized merchant strings.
