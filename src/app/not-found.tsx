import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative mx-auto min-h-screen w-full max-w-6xl overflow-hidden px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_8%_8%,rgba(255,103,58,0.15),transparent_42%),radial-gradient(circle_at_88%_18%,rgba(0,109,119,0.14),transparent_40%),linear-gradient(160deg,#f9f3e8_0%,#f1ebdd_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[repeating-linear-gradient(115deg,transparent,transparent_26px,rgba(16,12,10,0.02)_26px,rgba(16,12,10,0.03)_27px)] opacity-40 mix-blend-multiply"
        aria-hidden="true"
      />

      <section className="relative mx-auto grid max-w-2xl gap-8 overflow-hidden rounded-[32px] border border-[#1713110f] bg-[rgba(255,250,240,0.72)] p-10 shadow-[0_30px_70px_rgba(22,12,0,0.12)] backdrop-blur-[6px]">
        {/* Decorative 404 glow */}
        <div className="absolute -right-24 -bottom-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(255,98,53,0.1),transparent_70%)]" />

        <div className="flex flex-col gap-2">
          <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[#006d77]">
            Route Manifest Error
          </p>
          <div className="flex items-baseline gap-4 mt-2">
            <span className="font-['Syne','Avenir_Next','Segoe_UI',sans-serif] text-[clamp(4rem,12vw,6.5rem)] font-bold leading-none tracking-tighter text-[#ff6235]">
              404
            </span>
            <div className="h-10 w-[2px] bg-[#17131110]" />
            <h1 className="m-0 font-['Syne','Avenir_Next','Segoe_UI',sans-serif] text-[clamp(1.4rem,3vw,2.2rem)] font-bold tracking-tight text-[#171311]">
              Endpoint <br />not located.
            </h1>
          </div>
        </div>

        <p className="m-0 max-w-[48ch] text-[1.05rem] leading-relaxed text-[#5d5448]/90">
          The requested URL does not exist in our intelligence network.
          Return to the dashboard to initiate a fresh discovery search.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-[linear-gradient(125deg,#ff6235,#ec4f24_54%,#cc370f)] px-7 py-3.5 text-[0.95rem] font-['Syne','Avenir_Next','Segoe_UI',sans-serif] font-bold tracking-[0.02em] text-white transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(220,66,16,0.3)]"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/"
            className="rounded-full border border-[#17131118] bg-white/60 px-7 py-3.5 text-[0.92rem] font-bold text-[#171311] transition hover:bg-white/90 hover:border-[#17131130]"
          >
            Search New Company
          </Link>
        </div>
      </section>
    </main>
  );
}
