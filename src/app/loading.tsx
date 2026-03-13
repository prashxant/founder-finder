"use client";

const shimmerRows = ["w-3/5", "w-4/5", "w-2/3", "w-5/6", "w-1/2"];

export default function Loading() {
  return (
    <main className="relative mx-auto min-h-screen w-full max-w-6xl overflow-hidden px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      {/* Background System */}
      <div
        className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_12%_8%,rgba(255,103,58,0.15),transparent_38%),radial-gradient(circle_at_90%_12%,rgba(0,109,119,0.12),transparent_38%),linear-gradient(160deg,#f9f3e8_0%,#f1ebdd_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[repeating-linear-gradient(115deg,transparent,transparent_26px,rgba(16,12,10,0.02)_26px,rgba(16,12,10,0.03)_27px)] opacity-40 mix-blend-multiply"
        aria-hidden="true"
      />

      <section className="relative mx-auto grid max-w-3xl gap-6 overflow-hidden rounded-[32px] border border-[#1713110f] bg-[rgba(255,250,240,0.72)] p-9 shadow-[0_30px_70px_rgba(22,12,0,0.12)] backdrop-blur-[6px]">
        {/* Subtle decorative glow */}
        <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(255,190,140,0.25),transparent_70%)]" />

        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          {/* Custom Circular Loader */}
          <div className="relative h-20 w-20 flex-shrink-0">
            <svg className="h-full w-full -rotate-90 animate-[spin_3s_linear_infinite]" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-[#1713110a]"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="url(#loaderGradient)"
                strokeWidth="8"
                strokeDasharray="276"
                strokeDashoffset="200"
                strokeLinecap="round"
                className="animate-[dash_1.5s_ease-in-out_infinite]"
              />
              <defs>
                <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ff6235" />
                  <stop offset="100%" stopColor="#ffd26f" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-[#ff6235] animate-pulse" />
            </div>
          </div>

          <div className="relative">
            <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[#006d77]">
              Intelligence Pipeline
            </p>
            <h1 className="mt-2 font-['Syne','Avenir_Next','Segoe_UI',sans-serif] text-[clamp(1.6rem,4vw,2.4rem)] leading-[1.1] tracking-tight text-[#171311]">
              Assembling founder <br />
              <span className="text-[#ff6235]">intelligence...</span>
            </h1>
          </div>
        </div>

        <p className="relative max-w-[58ch] text-[1rem] leading-relaxed text-[#5d5448]/90">
          Initialising scraping engines and querying deep search databases.
          This usually takes about 15-20 seconds for deep coverage.
        </p>

        <div className="relative mt-2 grid gap-4 rounded-3xl border border-[#1713110a] bg-white/40 p-6 backdrop-blur-[2px]">
          {shimmerRows.map((widthClass, idx) => (
            <div
              className="flex items-center gap-4 group"
              key={`${widthClass}-${idx}`}
            >
              <div className="relative h-2.5 w-2.5">
                <span className="absolute inset-0 rounded-full bg-[#ff6235] opacity-20 animate-ping" />
                <span className="relative block h-full w-full rounded-full bg-[#ff6235]" />
              </div>
              <div
                className={`h-2.5 rounded-full bg-[linear-gradient(90deg,rgba(255,98,53,0.08),rgba(255,210,111,0.25),rgba(255,98,53,0.08))] ${widthClass} bg-[length:200%_100%] animate-[shimmer_2s_infinite_linear]`}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <div className="h-1 w-1 rounded-full bg-[#006d77]/40" />
          <p className="text-[0.78rem] font-medium text-[#006d77]/60 italic">
            Searching for LinkedIn, Twitter, and Email patterns
          </p>
        </div>
      </section>

      <style jsx global>{`
        @keyframes shimmer {
          from { background-position: 200% 0; }
          to { background-position: -200% 0; }
        }
        @keyframes dash {
          0% { stroke-dashoffset: 276; }
          50% { stroke-dashoffset: 70; transform: rotate(135deg); }
          100% { stroke-dashoffset: 276; transform: rotate(450deg); }
        }
      `}</style>
    </main>
  );
}
