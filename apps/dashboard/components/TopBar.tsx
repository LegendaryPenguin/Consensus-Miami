"use client";

import Link from "next/link";

type TopBarProps = {
  balanceLabel: string | null;
  addressShort: string;
  isLoadingDemo: boolean;
  onRunDemo: () => void;
  onOpenDeveloper: () => void;
};

export function TopBar({ balanceLabel, addressShort, isLoadingDemo, onRunDemo, onOpenDeveloper }: TopBarProps) {
  return (
    <header className="flex flex-col gap-4 rounded-2xl border border-border bg-panel/80 px-5 py-4 shadow-card backdrop-blur-sm md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-slate-50 md:text-2xl">TollGate Bazaar</h1>
          {balanceLabel ? (
            <span className="rounded-full border border-border bg-surface/80 px-3 py-1 text-xs font-medium text-slate-200">
              {balanceLabel}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-slate-400">Paid tools for Cursor agents.</p>
        <p className="mt-0.5 text-xs text-slate-500">
          Base Sepolia · x402 · {addressShort}
        </p>
      </div>
      <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
        <Link
          href="/connect-to-cursor"
          className="rounded-xl border border-border bg-surface/90 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-accent/40 hover:bg-surface"
        >
          Connect to Cursor
        </Link>
        <button
          type="button"
          disabled={isLoadingDemo}
          onClick={onRunDemo}
          className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition hover:bg-accent/20 disabled:opacity-50"
        >
          {isLoadingDemo ? "Running…" : "Run Demo"}
        </button>
        <button
          type="button"
          onClick={onOpenDeveloper}
          className="rounded-xl border border-border px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-slate-500 hover:text-slate-200"
        >
          Dev
        </button>
      </div>
    </header>
  );
}
