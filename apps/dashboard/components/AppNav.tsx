"use client";

import Link from "next/link";

type AppNavProps = {
  current: "home" | "marketplace" | "seller" | "connect" | "tools";
  networkLabel?: string;
  paymentMode?: string | null;
  apiOnline?: boolean | null;
};

const links: Array<{ key: AppNavProps["current"]; href: string; label: string }> = [
  { key: "home", href: "/", label: "Home" },
  { key: "marketplace", href: "/marketplace", label: "Marketplace" },
  { key: "seller", href: "/seller", label: "Seller" },
  { key: "connect", href: "/connect-to-cursor", label: "IDE setup" },
  { key: "tools", href: "/tools", label: "Tools" },
];

export function AppNav({ current, networkLabel = "Base Sepolia", paymentMode, apiOnline }: AppNavProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-hairline/80 bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <p className="text-lg font-semibold tracking-tight text-ink">TollGate Bazaar</p>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                  current === link.key ? "bg-raised text-ink" : "text-muted hover:bg-surface hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-hairline bg-surface px-2.5 py-1 text-muted">{networkLabel}</span>
          <span
            className={`rounded-full border px-2.5 py-1 font-medium ${
              paymentMode?.toLowerCase() === "x402"
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-hairline bg-surface text-muted"
            }`}
          >
            {paymentMode?.toLowerCase() ?? "—"}
          </span>
          {apiOnline !== undefined && apiOnline !== null ? (
            <span
              className={`rounded-full border px-2.5 py-1 ${
                apiOnline ? "border-success/35 bg-success/10 text-success" : "border-danger/35 bg-danger/10 text-danger"
              }`}
            >
              {apiOnline ? "online" : "offline"}
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
}
