<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Founder Finder Next.js App Router application. The following changes were made:

- **`instrumentation-client.ts`** (new): Initializes `posthog-js` client-side using the Next.js 15.3+ instrumentation pattern. PostHog loads via a `/ingest` reverse proxy with exception capture (`capture_exceptions: true`) and debug mode in development.
- **`next.config.ts`** (updated): Added PostHog reverse proxy rewrites (`/ingest/static/*` and `/ingest/*`) and `skipTrailingSlashRedirect: true` to support PostHog trailing-slash API requests.
- **`src/lib/posthog-server.ts`** (new): Singleton server-side PostHog client using `posthog-node`, for use in API routes.
- **`src/app/page.tsx`** (updated): Added `posthog-js` import and five `posthog.capture()` calls covering search submission, completion, failure, JSON copy, and JSON download. Errors are also captured via `posthog.captureException()`. Client-side distinct ID and session ID are forwarded to the API as custom headers for cross-domain correlation.
- **`src/app/api/find/route.ts`** (updated): Added server-side event capture using `posthog-node` for pipeline completion and failure. Reads `X-POSTHOG-DISTINCT-ID` and `X-POSTHOG-SESSION-ID` headers to correlate server events with client sessions.
- **`.env.local`** (updated): `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` set via `wizard-tools`.

## Events instrumented

| Event | Description | File |
|---|---|---|
| `founder_search_submitted` | User submitted the founder discovery form with a company URL and API keys | `src/app/page.tsx` |
| `founder_search_completed` | Founder pipeline completed successfully and returned results | `src/app/page.tsx` |
| `founder_search_failed` | Founder pipeline failed with an error (also captured as exception) | `src/app/page.tsx` |
| `result_copied` | User copied the founder result JSON to clipboard | `src/app/page.tsx` |
| `result_downloaded` | User downloaded the founder result as a JSON file | `src/app/page.tsx` |
| `api_find_completed` | Server-side: Founder pipeline API route completed successfully | `src/app/api/find/route.ts` |
| `api_find_failed` | Server-side: Founder pipeline API route failed with an error | `src/app/api/find/route.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard**: [Analytics basics](https://us.posthog.com/project/251798/dashboard/1358196)
- **Insight**: [Founder Search Conversion Funnel](https://us.posthog.com/project/251798/insights/tghAg8Pu) — funnel from search submitted → completed → result copied
- **Insight**: [Daily Search Volume (Submitted / Completed / Failed)](https://us.posthog.com/project/251798/insights/9u70QWo5) — day-by-day trend of all search outcomes
- **Insight**: [Result Exports (Copy vs Download)](https://us.posthog.com/project/251798/insights/NGXRpQ3t) — how users export their founder results
- **Insight**: [Weekly Active Searchers](https://us.posthog.com/project/251798/insights/BwqdkKlB) — weekly unique users running founder searches

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
