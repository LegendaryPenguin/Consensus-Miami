"use client";

import Link from "next/link";

type AppNavProps = {
  current: "home" | "marketplace" | "seller" | "connect" | "tools";
};

const links: Array<{ key: AppNavProps["current"]; href: string; label: string }> = [
  { key: "home", href: "/", label: "Home" },
  { key: "marketplace", href: "/marketplace", label: "Marketplace" },
  { key: "seller", href: "/seller", label: "Seller" },
  { key: "connect", href: "/connect-to-cursor", label: "IDE setup" },
  { key: "tools", href: "/tools", label: "Tools" },
];

export function AppNav({ current }: AppNavProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-hairline/80 bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <p className="text-lg font-semibold tracking-tight text-ink">HandOff</p>
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
      </div>
    </header>
  );
}
