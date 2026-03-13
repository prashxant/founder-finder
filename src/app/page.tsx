"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import posthog from "posthog-js";
import type { CompanyOutput, Founder } from "@/types";

type LoadState = "idle" | "loading" | "success" | "error";

const PIPELINE_STEPS = [
  "Phase 1: Scraping website signal",
  "Phase 2: Detecting founders and titles",
  "Phase 3: Enriching with internet search",
  "Phase 4: Building outreach profile",
];

const STEP_TIMINGS = [0, 3200, 8600, 15000];

const CARD_BASE_CLASS =
  "rounded-[24px] border border-[#1713111f] bg-[rgba(255,250,240,0.78)] shadow-[0_20px_60px_rgba(22,12,0,0.18)] backdrop-blur-[3px]";
const REVEAL_CLASS =
  "opacity-0 translate-y-4 motion-safe:animate-[riseIn_0.5s_ease_forwards]";
const EYEBROW_CLASS =
  "m-0 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[#006d77]";
const SECTION_TITLE_CLASS =
  "m-0 font-['Syne','Avenir_Next','Segoe_UI',sans-serif] text-2xl tracking-[0.01em] text-[#171311]";
const LABEL_CLASS = "grid gap-2 text-sm font-semibold text-[#171311]";
const INPUT_CLASS =
  "w-full rounded-xl border border-[#1713111f] bg-white/70 px-3.5 py-3 text-[0.94rem] text-[#171311] transition focus:border-[#ff6235b3] focus:shadow-[0_0_0_4px_rgba(255,98,53,0.16)] focus:outline-none";
const PRIMARY_BUTTON_CLASS =
  "rounded-full bg-[linear-gradient(125deg,#ff6235,#ec4f24_54%,#cc370f)] px-5 py-3 text-[0.95rem] font-['Syne','Avenir_Next','Segoe_UI',sans-serif] tracking-[0.03em] text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(220,66,16,0.34)] disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none";
const SECONDARY_BUTTON_CLASS =
  "rounded-full border border-[#1713112e] bg-white/80 px-5 py-3 text-[0.92rem] font-semibold text-[#171311] transition hover:border-[#ff62356b] hover:text-[#b23e1b]";
const TOKEN_CLASS =
  "inline-flex rounded-full border border-[#1713111f] bg-white/80 px-2.5 py-1 text-[0.82rem] text-[#171311]";
const FIELD_LINK_CLASS =
  "inline-flex items-center rounded-lg bg-amber-200 px-2 py-1 text-[0.78rem] font-semibold text-[#006d77] shadow-xs shadow-red-400 transition hover:text-[#004e55]";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [tavilyKey, setTavilyKey] = useState("");
  const [icp, setIcp] = useState("");

  const [state, setState] = useState<LoadState>("idle");
  const [result, setResult] = useState<CompanyOutput | null>(null);
  const [error, setError] = useState("");
  const [activeStep, setActiveStep] = useState(-1);
  const [completedStep, setCompletedStep] = useState(-1);
  const [copyStatus, setCopyStatus] = useState("");

  const timerIds = useRef<number[]>([]);

  useEffect(() => {
    timerIds.current.forEach((id) => window.clearTimeout(id));
    timerIds.current = [];

    if (state !== "loading") {
      return;
    }

    setActiveStep(0);
    setCompletedStep(-1);

    timerIds.current = STEP_TIMINGS.map((delay, index) =>
      window.setTimeout(() => {
        if (index > 0) {
          setCompletedStep(index - 1);
        }
        setActiveStep(index);
      }, delay),
    );

    return () => {
      timerIds.current.forEach((id) => window.clearTimeout(id));
      timerIds.current = [];
    };
  }, [state]);

  const hasFounders = useMemo(
    () => (result?.founders?.length || 0) > 0,
    [result],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!url.trim() || !openrouterKey.trim()) {
      return;
    }

    setState("loading");
    setError("");
    setResult(null);

    posthog.capture("founder_search_submitted", {
      company_url: url.trim(),
      has_tavily_key: Boolean(tavilyKey.trim()),
      has_icp: Boolean(icp.trim()),
    });

    try {
      const response = await fetch("/api/find", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-POSTHOG-DISTINCT-ID": posthog.get_distinct_id(),
          "X-POSTHOG-SESSION-ID": posthog.get_session_id() ?? "",
        },
        body: JSON.stringify({
          url: url.trim(),
          openrouterKey: openrouterKey.trim(),
          tavilyKey: tavilyKey.trim() || undefined,
          icp: icp.trim() || undefined,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Request failed.");
      }

      const companyResult = payload as CompanyOutput;
      setResult(companyResult);
      setActiveStep(-1);
      setCompletedStep(PIPELINE_STEPS.length - 1);
      setState("success");

      posthog.capture("founder_search_completed", {
        company_url: url.trim(),
        company_name: companyResult.company,
        founders_found: companyResult.founders.length,
        has_tavily_key: Boolean(tavilyKey.trim()),
        has_icp: Boolean(icp.trim()),
      });
    } catch (caught) {
      const errorMessage =
        caught instanceof Error ? caught.message : "Unknown request error.";
      setError(errorMessage);
      setActiveStep(-1);
      setState("error");

      posthog.capture("founder_search_failed", {
        company_url: url.trim(),
        error_message: errorMessage,
        has_tavily_key: Boolean(tavilyKey.trim()),
        has_icp: Boolean(icp.trim()),
      });
      posthog.captureException(caught instanceof Error ? caught : new Error(errorMessage));
    }
  }

  async function copyJson() {
    if (!result) {
      return;
    }

    await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopyStatus("Copied");
    window.setTimeout(() => setCopyStatus(""), 1200);

    posthog.capture("result_copied", {
      company_name: result.company,
      founders_count: result.founders.length,
    });
  }

  function downloadJson() {
    if (!result) {
      return;
    }

    const json = JSON.stringify(result, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${result.company || "founder"}-profile.json`;
    link.click();
    URL.revokeObjectURL(blobUrl);

    posthog.capture("result_downloaded", {
      company_name: result.company,
      founders_count: result.founders.length,
    });
  }


  return (
    <main className="relative mx-auto grid w-full max-w-6xl gap-5 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      {/* hjernejf */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[repeating-linear-gradient(115deg,transparent,transparent_26px,rgba(16,12,10,0.03)_26px,rgba(16,12,10,0.03)_27px)] opacity-50 mix-blend-multiply"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none fixed inset-0 -z-20"
        aria-hidden="true"
      >
        <div className="absolute left-[8%] top-[5%] h-72 w-72 rounded-full bg-[#ff6b253d] blur-3xl" />
        <div className="absolute right-[5%] top-[10%] h-80 w-80 rounded-full bg-[#006d7733] blur-3xl" />
      </div>

      <section
        className={`${CARD_BASE_CLASS} ${REVEAL_CLASS} relative overflow-hidden p-8 sm:p-6`}
      >
        <div className="pointer-events-none absolute -right-24 -top-36 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,210,111,0.5),transparent_60%)]" />
        <p className={EYEBROW_CLASS}>Founder Finder</p>
        <h1 className="mt-3 max-w-[20ch] font-['Syne','Avenir_Next','Segoe_UI',sans-serif] text-[clamp(2.1rem,4vw,3.7rem)] leading-[0.98] text-[#171311]">
          Turn one company URL into a founder outreach dossier.
        </h1>
        <p className="m-0 mt-4 max-w-[68ch] text-[1.03rem] text-[#5d5448]">
          Scrape site signal, enrich with web intelligence, and produce founder
          profiles with email patterns, socials, lead-fit scoring, and
          personalized cold outreach drafts.
        </p>
      </section>

      <section
        className={`${CARD_BASE_CLASS} ${REVEAL_CLASS}`}
        style={{ animationDelay: "80ms" }}
      >
        <h2 className="px-6 pt-6 sm:px-5 sm:pt-5" style={{ margin: 0 }}>
          <span className={SECTION_TITLE_CLASS}>Run Discovery</span>
        </h2>
        <form onSubmit={onSubmit} className="grid gap-4 px-6 pb-7 pt-5 sm:px-5">
          <label className={LABEL_CLASS}>
            Company URL
            <input
              className={INPUT_CLASS}
              type="url"
              placeholder="https://openai.com"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              required
            />
          </label>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className={LABEL_CLASS}>
              <span className="flex items-center gap-2">
                <span>OpenRouter API Key</span>
                <a
                  href="https://openrouter.ai/settings/keys"
                  target="_blank"
                  rel="noreferrer"
                  className={FIELD_LINK_CLASS}
                >
                  Get key
                </a>
              </span>
              <input
                className={INPUT_CLASS}
                type="password"
                placeholder="sk-or-v1-..."
                value={openrouterKey}
                onChange={(event) => setOpenrouterKey(event.target.value)}
                required
              />
            </label>

            <label className={LABEL_CLASS}>
              <span className="flex items-center gap-2">
                <span>Tavily API Key (optional)</span>
                <a
                  href="https://app.tavily.com/home"
                  target="_blank"
                  rel="noreferrer"
                  className={FIELD_LINK_CLASS}
                >
                  Get key
                </a>
              </span>
              <input
                className={INPUT_CLASS}
                type="password"
                placeholder="tvly-..."
                value={tavilyKey}
                onChange={(event) => setTavilyKey(event.target.value)}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className={LABEL_CLASS}>
              Ideal Customer Profile (optional)
              <input
                className={INPUT_CLASS}
                type="text"
                placeholder="B2B SaaS growth teams"
                value={icp}
                onChange={(event) => setIcp(event.target.value)}
              />
            </label>
          </div>

          <button
            type="submit"
            className={PRIMARY_BUTTON_CLASS}
            disabled={state === "loading"}
          >
            {state === "loading" ? "Running pipeline..." : "Find Founders"}
          </button>

          <p className="m-0 text-[0.82rem] text-[#5d5448]">
            Keys are used only for this request and are not persisted.
          </p>
        </form>
      </section>

      {(state === "loading" || state === "success") && (
        <section
          className={`${CARD_BASE_CLASS} ${REVEAL_CLASS}`}
          style={{ animationDelay: "160ms" }}
        >
          <h3 className="px-6 pt-6 font-['Syne','Avenir_Next','Segoe_UI',sans-serif] text-2xl tracking-[0.01em] text-[#171311] sm:px-5 sm:pt-5">
            Pipeline
          </h3>
          <div className="grid gap-2.5 px-6 pb-6 pt-4 text-[0.92rem] sm:px-5 sm:pb-5">
            {PIPELINE_STEPS.map((step, index) => {
              const status: "done" | "active" | "waiting" =
                index <= completedStep
                  ? "done"
                  : index === activeStep
                    ? "active"
                    : "waiting";

              const stepStyle =
                status === "done"
                  ? "border-[#006d7757] bg-white/80"
                  : status === "active"
                    ? "border-solid border-[#ff623573] bg-white/80"
                    : "border-[#1713111f] bg-white/55";

              const dotStyle =
                status === "done"
                  ? "bg-[#006d77]"
                  : status === "active"
                    ? "bg-[#ff6235] animate-pulse"
                    : "bg-[#d3c8ba]";

              return (
                <div
                  className={`flex items-center gap-2.5 rounded-2xl border border-dashed px-3 py-2.5 ${stepStyle}`}
                  key={step}
                >
                  <span
                    className={`h-[11px] w-[11px] rounded-full ${dotStyle}`}
                    aria-hidden="true"
                  />
                  <span>{step}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {state === "error" && (
        <section
          className={`${CARD_BASE_CLASS} border-[#a62c2c59] bg-[rgba(255,241,241,0.84)] p-6`}
        >
          <h3 className="m-0 font-['Syne','Avenir_Next','Segoe_UI',sans-serif] text-2xl text-[#7f2020]">
            Request Failed
          </h3>
          <p className="mb-0 mt-3 text-[#5f2b2b]">{error}</p>
        </section>
      )}

      {result && (
        <section
          className={`grid gap-4 ${REVEAL_CLASS}`}
          style={{ animationDelay: "240ms" }}
        >
          <header className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className={EYEBROW_CLASS}>Result</p>
              <h2 className="m-0 mt-1 font-['Syne','Avenir_Next','Segoe_UI',sans-serif] text-[clamp(1.4rem,2vw,2rem)] text-[#171311]">
                {result.company}
                <span className="ml-2 font-['IBM_Plex_Sans','Avenir_Next','Segoe_UI',sans-serif] text-[0.95rem] text-[#5d5448]">
                  ({result.website})
                </span>
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={PRIMARY_BUTTON_CLASS}
                onClick={copyJson}
              >
                {copyStatus || "Copy JSON"}
              </button>
              <button
                type="button"
                className={SECONDARY_BUTTON_CLASS}
                onClick={downloadJson}
              >
                Download
              </button>
            </div>
          </header>

          {!hasFounders && (
            <article className={`${CARD_BASE_CLASS} p-6`}>
              <h3 className="m-0 font-['Syne','Avenir_Next','Segoe_UI',sans-serif] text-2xl text-[#171311]">
                No founders identified
              </h3>
              <p className="m-0 mt-2 text-[#5d5448]">
                Try enabling Tavily search or using a company URL with richer
                team/about content for stronger coverage.
              </p>
            </article>
          )}

          {result.founders.map((founder, index) => (
            <FounderCard
              founder={founder}
              key={`${founder.name}-${index}`}
              delayMs={index * 110}
            />
          ))}

          <details
            className={`${CARD_BASE_CLASS} rounded-2xl border-dashed bg-white/65 p-4`}
          >
            <summary className="cursor-pointer font-semibold text-[#171311]">
              Inspect raw JSON
            </summary>
            <pre className="mt-3 overflow-x-auto text-[0.79rem] text-[#2e281f]">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </section>
      )}
    </main>
  );
}

function FounderCard({
  founder,
  delayMs,
}: {
  founder: Founder;
  delayMs: number;
}) {
  const confidence = Math.max(0, Math.min(1, founder.confidence_score || 0));
  const confidenceLabel = `${Math.round(confidence * 100)}% confidence`;
  const confidenceClass =
    confidence >= 0.8
      ? "border-[#0a7f4f59] bg-[#0a7f4f1f] text-[#0a7f4f]"
      : confidence >= 0.5
        ? "border-[#9a5f0057] bg-[#9a5f001f] text-[#9a5f00]"
        : "border-[#a62c2c57] bg-[#a62c2c1f] text-[#a62c2c]";

  return (
    <article
      className={`${CARD_BASE_CLASS} grid gap-4 rounded-[20px] p-5 opacity-0 [transform:translateY(18px)_rotateX(4deg)] motion-safe:animate-[founderIn_0.54s_ease_forwards]`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
        <div>
          <h3 className="m-0 font-['Syne','Avenir_Next','Segoe_UI',sans-serif] text-[1.3rem] text-[#171311]">
            {founder.name || "Unknown Founder"}
          </h3>
          <p className="m-0 mt-1 text-[#5d5448]">
            {founder.title || "Founder"}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1.5 text-[0.75rem] font-bold uppercase tracking-[0.05em] ${confidenceClass}`}
        >
          {confidenceLabel}
        </span>
      </div>

      {founder.emails?.length > 0 && (
        <section>
          <h4 className="mb-2 text-[0.75rem] uppercase tracking-[0.14em] text-[#5d5448]">
            Email Patterns
          </h4>
          <div className="flex flex-wrap gap-2">
            {founder.emails.slice(0, 6).map((email) => (
              <span key={email} className={TOKEN_CLASS}>
                {email}
              </span>
            ))}
          </div>
        </section>
      )}

      {founder.socials && Object.keys(founder.socials).length > 0 && (
        <section>
          <h4 className="mb-2 text-[0.75rem] uppercase tracking-[0.14em] text-[#5d5448]">
            Social Profiles
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(founder.socials)
              .filter(([, value]) => Boolean(value))
              .map(([platform, profileUrl]) => (
                <a
                  key={`${platform}-${profileUrl}`}
                  href={profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`${TOKEN_CLASS} transition hover:border-[#ff62356b] hover:text-[#b23e1b]`}
                >
                  {platform}
                </a>
              ))}
          </div>
        </section>
      )}

      {founder.lead_score && (
        <section>
          <h4 className="mb-2 text-[0.75rem] uppercase tracking-[0.14em] text-[#5d5448]">
            Lead Score
          </h4>
          <div className="flex items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#160c0014]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#ff6235,#ffd26f)]"
                style={{
                  width: `${Math.max(0, Math.min(100, founder.lead_score.score))}%`,
                }}
              />
            </div>
            <strong>{founder.lead_score.score}</strong>
          </div>
          <p className="mb-0 mt-2 text-[0.87rem] text-[#5d5448]">
            {founder.lead_score.reasoning}
          </p>
        </section>
      )}

      {founder.cold_email_draft && (
        <section className="rounded-2xl border border-[#006d7757] bg-[linear-gradient(135deg,rgba(0,109,119,0.11),rgba(0,109,119,0.03))] p-4">
          <h4 className="mb-2 text-[0.75rem] uppercase tracking-[0.14em] text-[#5d5448]">
            Cold Email Draft
          </h4>
          {founder.cold_email_subject && (
            <p className="mb-2 text-[0.82rem] font-bold text-[#006d77]">
              Subject: {founder.cold_email_subject}
            </p>
          )}
          <p className="m-0">{founder.cold_email_draft}</p>
        </section>
      )}
    </article>
  );
}
