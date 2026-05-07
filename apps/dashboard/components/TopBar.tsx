"use client";

import Link from "next/link";

type TopBarProps = {
  balanceLabel: string | null;
  addressShort: string;
  networkLabel: string;
  paymentModeLabel: string | null;
  apiOk: boolean | null;
  onOpenTools: () => void;
  sellerHref?: string;
};

export function TopBar({
  balanceLabel,
  addressShort,
  networkLabel,
  paymentModeLabel,
  apiOk,
  onOpenTools,
  sellerHref = "/seller",
}: TopBarProps) {
  const mode = paymentModeLabel?.toLowerCase() === "x402" ? "x402" : paymentModeLabel?.toLowerCase() === "mock" ? "mock" : "—";

  return (
    <header className="flex flex-col gap-4 rounded-panel border border-hairline bg-surface px-5 py-5 shadow-card md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight text-ink md:text-2xl">TollGate Bazaar</h1>
          {balanceLabel ? (
            <span className="rounded-full border border-hairline bg-raised px-2.5 py-1 text-xs font-medium text-ink">
              {balanceLabel}
            </span>
          ) : null}
          <span className="rounded-full border border-hairline bg-raised px-2.5 py-1 text-xs font-medium text-muted">
            {networkLabel}
          </span>
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
              mode === "x402"
                ? "border-accent/30 bg-accent/10 text-accent"
                : "border-hairline bg-raised text-muted"
            }`}
          >
            {mode}
          </span>
          {apiOk !== null ? (
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                apiOk ? "border-success/35 bg-success/10 text-success" : "border-danger/35 bg-danger/10 text-danger"
              }`}
              title="Paid API reachability"
            >
              {apiOk ? "Online" : "Offline"}
            </span>
          ) : null}
        </div>
        <p className="mt-1 font-mono text-[11px] text-muted">Buyer · {addressShort}</p>
      </div>
      <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
        <Link
          href={sellerHref}
          className="rounded border border-hairline bg-raised px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-hairlineStrong hover:bg-mutedSurface"
        >
          Seller
        </Link>
        <Link
          href="/connect-to-cursor"
          className="rounded border border-hairline bg-raised px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-hairlineStrong hover:bg-mutedSurface"
        >
          IDE setup
        </Link>
        <button
          type="button"
          onClick={onOpenTools}
          className="rounded border border-accent bg-accent px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accentPress focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Tools
        </button>
      </div>
    </header>
  );
}
