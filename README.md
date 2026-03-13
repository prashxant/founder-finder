# Founder Finder (Next.js)

Founder Finder is a Next.js app that turns a company URL into a founder outreach dossier: names, roles, email patterns, social profiles, lead score, and personalized cold email drafts.

## Quick Start

```bash
cd founder-finder
npm install
npx playwright install chromium
npm run dev
```

Open http://localhost:3000.

## Runtime API Keys

You can paste keys directly into the UI for each request:

- OpenRouter key: https://openrouter.ai/keys
- Tavily key (optional): https://tavily.com

Keys are sent per request and are not persisted by the app.

## Pipeline

1. Scrape the target website and relevant team/about pages using Playwright.
2. Run LLM extraction for founder candidates.
3. Enrich context using Tavily internet search.
4. Generate final founder profiles, lead scoring, and cold email drafts.

## Scripts

```bash
npm run dev
npm run build
npm run start
```

## Project Structure

```text
src/
  app/
    api/find/route.ts      # POST API endpoint
    globals.css            # App styling
    layout.tsx
    page.tsx               # Frontend UI
  extractor.ts             # OpenRouter extraction and draft generation
  pipeline.ts              # Full founder-finder pipeline orchestration
  scraper.ts               # Playwright scraping
  search.ts                # Tavily search + social link extraction
  types.ts                 # Shared schemas and types
```
