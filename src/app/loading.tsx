const shimmerRows = ["w-3/5", "w-4/5", "w-2/3", "w-5/6"];

export default function Loading() {
  return (
    <main className="relative mx-auto min-h-screen w-full max-w-6xl overflow-hidden px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_12%_8%,rgba(255,103,58,0.2),transparent_38%),radial-gradient(circle_at_90%_12%,rgba(0,109,119,0.2),transparent_38%),linear-gradient(160deg,#f9f3e8_0%,#f1ebdd_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[repeating-linear-gradient(115deg,transparent,transparent_26px,rgba(16,12,10,0.03)_26px,rgba(16,12,10,0.03)_27px)] opacity-50 mix-blend-multiply"
        aria-hidden="true"
      />

      <section className="mx-auto grid max-w-3xl gap-5 rounded-[28px] border border-[#1713111f] bg-[rgba(255,250,240,0.78)] p-7 shadow-[0_20px_60px_rgba(22,12,0,0.18)] backdrop-blur-[3px]">
        <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[#006d77]">
          Founder Finder
        </p>
        <h1 className="m-0 font-['Syne','Avenir_Next','Segoe_UI',sans-serif] text-[clamp(1.9rem,4vw,3rem)] leading-[0.98] text-[#171311]">
          Warming up founder intelligence...
        </h1>
        <p className="m-0 max-w-[62ch] text-[1rem] text-[#5d5448]">
          We are preparing the pipeline and loading the data workspace.
        </p>

        <div className="grid gap-3 rounded-2xl border border-dashed border-[#17131124] bg-white/60 p-4">
          {shimmerRows.map((widthClass, idx) => (
            <div
              className="flex items-center gap-3 rounded-xl border border-[#1713111f] bg-white/80 px-3 py-2.5"
              key={`${widthClass}-${idx}`}
            >
              <span className="h-2.75 w-2.75 rounded-full bg-[#ff6235] animate-pulse" />
              <span
                className={`h-2.5 rounded-full bg-[linear-gradient(90deg,rgba(255,98,53,0.2),rgba(255,210,111,0.55),rgba(255,98,53,0.2))] ${widthClass} bg-size-[220%_100%] motion-safe:animate-[pulse_1.2s_ease-in-out_infinite]`}
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
