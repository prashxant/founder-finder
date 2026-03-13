import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative mx-auto min-h-screen w-full max-w-6xl overflow-hidden px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_8%_8%,rgba(255,103,58,0.2),transparent_42%),radial-gradient(circle_at_88%_18%,rgba(0,109,119,0.18),transparent_40%),linear-gradient(160deg,#f9f3e8_0%,#f1ebdd_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[repeating-linear-gradient(115deg,transparent,transparent_26px,rgba(16,12,10,0.03)_26px,rgba(16,12,10,0.03)_27px)] opacity-50 mix-blend-multiply"
        aria-hidden="true"
      />

      <section className="relative mx-auto grid max-w-3xl gap-6 rounded-[28px] border border-[#1713111f] bg-[rgba(255,250,240,0.78)] p-8 shadow-[0_20px_60px_rgba(22,12,0,0.18)] backdrop-blur-[3px]">
        <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[#006d77]">
          Founder Finder
        </p>

        <div className="flex items-end gap-3">
          <span className="font-['Syne','Avenir_Next','Segoe_UI',sans-serif] text-[clamp(3rem,10vw,7rem)] leading-none text-[#ff6235]">
            404
          </span>
          <h1 className="m-0 pb-2 font-['Syne','Avenir_Next','Segoe_UI',sans-serif] text-[clamp(1.4rem,3vw,2rem)] text-[#171311]">
            This page slipped through the pipeline.
          </h1>
        </div>

        <p className="m-0 max-w-[64ch] text-[1rem] text-[#5d5448]">
          The URL does not match any route in this app. Head back and run a new
          founder discovery search.
        </p>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/"
            className="rounded-full bg-[linear-gradient(125deg,#ff6235,#ec4f24_54%,#cc370f)] px-5 py-3 text-[0.95rem] font-['Syne','Avenir_Next','Segoe_UI',sans-serif] tracking-[0.03em] text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(220,66,16,0.34)]"
          >
            Back to Home
          </Link>
          <Link
            href="/"
            className="rounded-full border border-[#1713112e] bg-white/80 px-5 py-3 text-[0.92rem] font-semibold text-[#171311] transition hover:border-[#ff62356b] hover:text-[#b23e1b]"
          >
            Start New Search
          </Link>
        </div>
      </section>
    </main>
  );
}
