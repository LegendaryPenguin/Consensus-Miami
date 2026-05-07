"use client";

import { LANDING_SCROLL_STAGES } from "./landingScrollStages";

type Tx = { txHash: string; amountUsdc: string };

export function LandingScrollFallback({ latestTx }: { latestTx?: Tx }) {
  return (
    <section className="mx-auto max-w-6xl space-y-4 px-4 py-10 md:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">How it works</p>
      <div className="grid gap-3 md:grid-cols-2">
        {LANDING_SCROLL_STAGES.map((s, i) => (
          <article key={s.title} className="rounded-panel border border-hairline bg-surface p-4 shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Step {i + 1}</p>
            <h3 className="mt-1 text-lg font-semibold tracking-tight text-ink md:text-xl">{s.title}</h3>
            <p className="mt-2 text-sm text-muted">{s.subtitle}</p>
          </article>
        ))}
      </div>
      {latestTx ? (
        <p className="text-xs text-muted">
          Latest transfer:{" "}
          <span className="font-medium text-ink">
            {latestTx.amountUsdc} USDC ·{" "}
            <a
              href={`https://sepolia.basescan.org/tx/${latestTx.txHash}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-link hover:underline"
            >
              {latestTx.txHash.slice(0, 10)}…{latestTx.txHash.slice(-6)}
            </a>
          </span>
        </p>
      ) : null}
    </section>
  );
}
