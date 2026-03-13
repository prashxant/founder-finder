# Founder Finder

Founder Finder turns a single company URL into a founder outreach dossier.

It combines website scraping, LLM extraction, optional web search enrichment, and lead-focused output generation (emails, social profiles, confidence, and cold email drafts).

## What It Does

- Scrapes a company site (homepage + team/about pages) using Playwright.
- Extracts founders and contact context through OpenRouter-compatible models.
- Optionally enriches results with Tavily web search.
- Optionally applies ICP-aware lead scoring.
- Returns structured JSON and supports copy/download from the UI.
- Captures product analytics with PostHog (client + server events).

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Playwright (Chromium)
- OpenAI SDK (pointed at OpenRouter)
- Tavily API
- Zod validation
- PostHog analytics

## Quick Start

### 1. Prerequisites

- Node.js 20+
- npm
- An OpenRouter API key (required at runtime)
- Tavily API key (optional)

### 2. Install

```bash
npm install
```

`postinstall` automatically installs Playwright Chromium.

### 3. Configure Environment

Create/update `.env.local`:

```bash
# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Optional defaults
OPENROUTER_MODEL=google/gemini-2.0-flash-001
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxx
```

Notes:

- `openrouterKey` is submitted per request from the UI/API body and is required to run extraction.
- `TAVILY_API_KEY` is optional. You can also pass `tavilyKey` in request body.

### 4. Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Usage

In the UI, provide:

- Company URL (required)
- OpenRouter API key (required)
- Tavily API key (optional)
- ICP text (optional)

Then click **Find Founders**.

## API

### `POST /api/find`

Request body:

```json
{
  "url": "https://openai.com",
  "openrouterKey": "sk-or-v1-...",
  "tavilyKey": "tvly-...",
  "icp": "B2B SaaS growth teams",
  "model": "google/gemini-2.0-flash-001"
}
```

`tavilyKey`, `icp`, and `model` are optional.

Response shape:

```json
{
  "company": "openai.com",
  "website": "https://openai.com",
  "founders": [
    {
      "name": "...",
      "title": "...",
      "emails": ["..."],
      "socials": {
        "linkedin": "https://..."
      },
      "personal_website": "https://...",
      "phone": "...",
      "confidence_score": 0.88,
      "cold_email_draft": "...",
      "cold_email_subject": "quick thought",
      "lead_score": {
        "score": 72,
        "reasoning": "..."
      }
    }
  ]
}
```

## Pipeline Overview

1. Scrape website content (`src/scraper.ts`).
2. Run initial founder extraction (`src/extractor.ts`).
3. Enrich with web search/social discovery when Tavily is available (`src/search.ts`).
4. Run final extraction with full context and return normalized output (`src/pipeline.ts`).

## Project Structure

```text
src/
  app/
    api/find/route.ts      # API endpoint
    page.tsx               # UI + client-side analytics
    providers.tsx          # PostHog provider
  extractor.ts             # OpenRouter-based extraction
  pipeline.ts              # Orchestration
  scraper.ts               # Playwright scraping
  search.ts                # Tavily enrichment
  types.ts                 # Zod schemas and TS types
  lib/posthog-server.ts    # Server-side PostHog client
scripts/
  install-playwright.mjs   # Chromium install helper
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Troubleshooting

- Playwright launch/install issues:
  - Re-run `npm install`.
  - Or manually run `npx playwright install chromium`.
- `Failed to fetch` in UI:
  - Ensure the app is running on `http://localhost:3000`.
- Empty/low-quality founder output:
  - Try a more content-rich company URL or pass Tavily key for enrichment.
- Auth/rate-limit errors:
  - Validate your OpenRouter/Tavily keys and provider limits.

## Analytics Events (PostHog)

Client events:

- `founder_search_submitted`
- `founder_search_completed`
- `founder_search_failed`
- `result_copied`
- `result_downloaded`

Server events:

- `api_find_completed`
- `api_find_failed`

## Security Notes

- Do not commit API keys.
- Keep `.env.local` out of version control.
- User-entered keys are used at request time and should be handled as secrets.

## License

The project is currently marked as private in `package.json`. Add a license if you plan to make it public.
