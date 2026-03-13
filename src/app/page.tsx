"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { CompanyOutput, Founder } from "@/types";

type LoadState = "idle" | "loading" | "success" | "error";

const PIPELINE_STEPS = [
  "Phase 1: Scraping website signal",
  "Phase 2: Detecting founders and titles",
  "Phase 3: Enriching with internet search",
  "Phase 4: Building outreach profile",
];

const STEP_TIMINGS = [0, 3200, 8600, 15000];

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

    try {
      const response = await fetch("/api/find", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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

      setResult(payload as CompanyOutput);
      setActiveStep(-1);
      setCompletedStep(PIPELINE_STEPS.length - 1);
      setState("success");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unknown request error.",
      );
      setActiveStep(-1);
      setState("error");
    }
  }

  async function copyJson() {
    if (!result) {
      return;
    }

    await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopyStatus("Copied");
    window.setTimeout(() => setCopyStatus(""), 1200);
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
  }

  return (
    <main className="page">
      <div className="atmosphere" aria-hidden="true" />
      <section className="hero card reveal-first">
        <p className="eyebrow">Founder Finder</p>
        <h1>Turn one company URL into a founder outreach dossier.</h1>
        <p className="hero-copy">
          Scrape site signal, enrich with web intelligence, and produce founder
          profiles with email patterns, socials, lead-fit scoring, and
          personalized cold outreach drafts.
        </p>
      </section>

      <section className="card reveal-second">
        <h2>Run Discovery</h2>
        <form onSubmit={onSubmit} className="finder-form">
          <label>
            Company URL
            <input
              type="url"
              placeholder="https://openai.com"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              required
            />
          </label>

          <div className="row two-col">
            <label>
              OpenRouter API Key
              <input
                type="password"
                placeholder="sk-or-v1-..."
                value={openrouterKey}
                onChange={(event) => setOpenrouterKey(event.target.value)}
                required
              />
            </label>

            <label>
              Tavily API Key (optional)
              <input
                type="password"
                placeholder="tvly-..."
                value={tavilyKey}
                onChange={(event) => setTavilyKey(event.target.value)}
              />
            </label>
          </div>

          <div className="row two-col">
            <label>
              Ideal Customer Profile (optional)
              <input
                type="text"
                placeholder="B2B SaaS growth teams"
                value={icp}
                onChange={(event) => setIcp(event.target.value)}
              />
            </label>
          </div>

          <button type="submit" disabled={state === "loading"}>
            {state === "loading" ? "Running pipeline..." : "Find Founders"}
          </button>

          <p className="key-note">
            Keys are used only for this request and are not persisted.
          </p>
        </form>
      </section>

      {(state === "loading" || state === "success") && (
        <section className="card reveal-third">
          <h3>Pipeline</h3>
          <div className="steps">
            {PIPELINE_STEPS.map((step, index) => {
              const status =
                index <= completedStep
                  ? "done"
                  : index === activeStep
                    ? "active"
                    : "waiting";

              return (
                <div className={`step ${status}`} key={step}>
                  <span className="dot" aria-hidden="true" />
                  <span>{step}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {state === "error" && (
        <section className="card error-card">
          <h3>Request Failed</h3>
          <p>{error}</p>
        </section>
      )}

      {result && (
        <section className="results reveal-fourth">
          <header className="result-header">
            <div>
              <p className="eyebrow">Result</p>
              <h2>
                {result.company} <span>({result.website})</span>
              </h2>
            </div>
            <div className="result-actions">
              <button type="button" onClick={copyJson}>
                {copyStatus || "Copy JSON"}
              </button>
              <button type="button" onClick={downloadJson}>
                Download
              </button>
            </div>
          </header>

          {!hasFounders && (
            <article className="card empty-state">
              <h3>No founders identified</h3>
              <p>
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

          <details className="raw-json">
            <summary>Inspect raw JSON</summary>
            <pre>{JSON.stringify(result, null, 2)}</pre>
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
      ? "confidence-high"
      : confidence >= 0.5
        ? "confidence-medium"
        : "confidence-low";

  return (
    <article
      className="card founder-card"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="founder-top">
        <div>
          <h3>{founder.name || "Unknown Founder"}</h3>
          <p>{founder.title || "Founder"}</p>
        </div>
        <span className={`confidence-pill ${confidenceClass}`}>
          {confidenceLabel}
        </span>
      </div>

      {founder.emails?.length > 0 && (
        <section>
          <h4>Email Patterns</h4>
          <div className="token-list">
            {founder.emails.slice(0, 6).map((email) => (
              <span key={email}>{email}</span>
            ))}
          </div>
        </section>
      )}

      {founder.socials && Object.keys(founder.socials).length > 0 && (
        <section>
          <h4>Social Profiles</h4>
          <div className="token-list link-list">
            {Object.entries(founder.socials)
              .filter(([, value]) => Boolean(value))
              .map(([platform, profileUrl]) => (
                <a
                  key={`${platform}-${profileUrl}`}
                  href={profileUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {platform}
                </a>
              ))}
          </div>
        </section>
      )}

      {founder.lead_score && (
        <section>
          <h4>Lead Score</h4>
          <div className="score-row">
            <div className="score-track">
              <div
                className="score-fill"
                style={{
                  width: `${Math.max(0, Math.min(100, founder.lead_score.score))}%`,
                }}
              />
            </div>
            <strong>{founder.lead_score.score}</strong>
          </div>
          <p className="muted-copy">{founder.lead_score.reasoning}</p>
        </section>
      )}

      {founder.cold_email_draft && (
        <section className="email-box">
          <h4>Cold Email Draft</h4>
          {founder.cold_email_subject && (
            <p className="subject">Subject: {founder.cold_email_subject}</p>
          )}
          <p>{founder.cold_email_draft}</p>
        </section>
      )}
    </article>
  );
}
