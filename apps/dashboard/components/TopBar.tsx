"use client";

import Link from "next/link";

type TopBarProps = {
  addressShort: string;
  onOpenTools: () => void;
  sellerHref?: string;
};

export function TopBar({
  addressShort,
  onOpenTools,
  sellerHref = "/seller",
}: TopBarProps) {
  return (
    <header className="flex flex-col gap-4 rounded-panel border border-hairline bg-surface px-5 py-5 shadow-card md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight text-ink md:text-2xl">HandOff</h1>
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
