"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Keep this in place so production errors can still be inspected in logs.
    console.error(error);
  }, [error]);

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-6xl overflow-hidden px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_10%_10%,rgba(166,44,44,0.15),transparent_36%),radial-gradient(circle_at_88%_14%,rgba(0,109,119,0.12),transparent_38%),linear-gradient(160deg,#f9f3e8_0%,#f1ebdd_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[repeating-linear-gradient(115deg,transparent,transparent_26px,rgba(16,12,10,0.02)_26px,rgba(16,12,10,0.03)_27px)] opacity-40 mix-blend-multiply"
        aria-hidden="true"
      />

      <section className="relative mx-auto grid max-w-2xl gap-6 overflow-hidden rounded-[32px] border border-[#a62c2c1f] bg-[rgba(255,241,241,0.76)] p-9 shadow-[0_30px_70px_rgba(45,16,16,0.12)] backdrop-blur-[6px]">
        {/* Decorative error glow */}
        <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(166,44,44,0.12),transparent_70%)]" />

        <div className="relative">
          <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[#7f2020]">
            System Interruption
          </p>
          <h1 className="mt-3 font-['Syne','Avenir_Next','Segoe_UI',sans-serif] text-[clamp(1.8rem,4vw,2.8rem)] leading-[1.1] tracking-tight text-[#7f2020]">
            Something stalled <br />
            in the <span className="text-[#a62c2c]">pipeline.</span>
          </h1>
          <p className="mt-4 max-w-[50ch] text-[1rem] leading-relaxed text-[#5f2b2b]/90">
            We encountered an unexpected error while processing your request.
            This could be a temporary API disruption or a parsing issue.
          </p>
        </div>

        {error.message && (
          <div className="relative mt-2 overflow-hidden rounded-2xl border border-[#a62c2c1a] bg-white/40 p-5 backdrop-blur-[2px]">
            <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-wider text-[#7f2020]/60">Technical Detail</p>
            <pre className="m-0 overflow-x-auto text-[0.82rem] font-medium text-[#5f2b2b]">
              {error.message}
            </pre>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-[linear-gradient(125deg,#b73737,#a62c2c_56%,#872222)] px-7 py-3.5 text-[0.95rem] font-['Syne','Avenir_Next','Segoe_UI',sans-serif] font-bold tracking-[0.02em] text-white transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(127,32,32,0.3)]"
          >
            Try Recalibrating
          </button>
          <Link
            href="/"
            className="rounded-full border border-[#17131118] bg-white/60 px-7 py-3.5 text-[0.92rem] font-bold text-[#171311] transition hover:bg-white/90 hover:border-[#17131130]"
          >
            Return Home
          </Link>
        </div>

        {error.digest && (
          <p className="mt-4 border-t border-[#a62c2c0a] pt-4 text-[0.7rem] font-medium tracking-tight text-[#7f2020]/40">
            Internal ID: <span className="font-mono">{error.digest}</span>
          </p>
        )}
      </section>
    </main>
  );
}
