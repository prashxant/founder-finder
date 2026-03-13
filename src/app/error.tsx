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
        className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_10%_10%,rgba(166,44,44,0.2),transparent_36%),radial-gradient(circle_at_88%_14%,rgba(0,109,119,0.2),transparent_38%),linear-gradient(160deg,#f9f3e8_0%,#f1ebdd_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[repeating-linear-gradient(115deg,transparent,transparent_26px,rgba(16,12,10,0.03)_26px,rgba(16,12,10,0.03)_27px)] opacity-50 mix-blend-multiply"
        aria-hidden="true"
      />

      <section className="relative mx-auto grid max-w-3xl gap-5 rounded-[28px] border border-[#a62c2c45] bg-[rgba(255,241,241,0.86)] p-8 shadow-[0_20px_60px_rgba(45,16,16,0.2)] backdrop-blur-[3px]">
        <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[#7f2020]">
          Founder Finder
        </p>
        <h1 className="m-0 font-['Syne','Avenir_Next','Segoe_UI',sans-serif] text-[clamp(1.7rem,4vw,2.7rem)] leading-[0.98] text-[#7f2020]">
          Something broke while rendering this page.
        </h1>
        <p className="m-0 text-[1rem] text-[#5f2b2b]">
          Try again, or go back to the home page to restart the flow.
        </p>

        {error.message ? (
          <pre className="m-0 overflow-x-auto rounded-xl border border-[#a62c2c3d] bg-white/65 p-3 text-[0.8rem] text-[#5f2b2b]">
            {error.message}
          </pre>
        ) : null}

        {error.digest ? (
          <p className="m-0 text-[0.82rem] font-semibold text-[#7f2020]">
            Error Digest: {error.digest}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-[linear-gradient(125deg,#b73737,#a62c2c_56%,#872222)] px-5 py-3 text-[0.95rem] font-['Syne','Avenir_Next','Segoe_UI',sans-serif] tracking-[0.03em] text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(127,32,32,0.34)]"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="rounded-full border border-[#1713112e] bg-white/80 px-5 py-3 text-[0.92rem] font-semibold text-[#171311] transition hover:border-[#ff62356b] hover:text-[#b23e1b]"
          >
            Go Home
          </Link>
        </div>
      </section>
    </main>
  );
}
