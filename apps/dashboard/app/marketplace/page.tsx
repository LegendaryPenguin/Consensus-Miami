"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { listAgents } from "@tollgate/shared";
import { useRouter } from "next/navigation";
import { AppNav } from "../../components/AppNav";
import { MarketplaceGrid, type MarketplaceCard } from "../../components/MarketplaceGrid";
import { TransactionHistory } from "../../components/TransactionHistory";
import { GlobeBackground } from "../../components/GlobeBackground";

const apiBaseUrl = process.env.NEXT_PUBLIC_TOLLGATE_API_URL ?? "http://localhost:4000";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const GOOGLE_USER_KEY = "tg_marketplace_google_user";

type GoogleUser = { name: string; email: string };

export default function MarketplacePage() {
  const router = useRouter();
  const sharedAgents = useMemo(() => listAgents(), []);
  const [marketplaceCards, setMarketplaceCards] = useState<MarketplaceCard[]>(() => toMarketplaceCards(sharedAgents));
  const [selectedAgentId] = useState("hackathon-research-agent");
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [buyerBalance, setBuyerBalance] = useState<string | null>(null);
  const [txHistory, setTxHistory] = useState<Array<{ txHash: string; timestamp: string; amountUsdc: string }>>([]);
  const [txHistoryLoading, setTxHistoryLoading] = useState(true);
  const [txHistoryError, setTxHistoryError] = useState<string | null>(null);
  const [lastHistoryRefreshAt, setLastHistoryRefreshAt] = useState<number | null>(null);

  const buyerDisplayShort = useMemo(() => {
    const env = process.env.NEXT_PUBLIC_BUYER_WALLET_ADDRESS?.trim();
    if (env && /^0x[a-fA-F0-9]{40}$/i.test(env)) return shortenAddress(env) ?? env.slice(0, 10);
    return "configure buyer";
  }, []);

  const refreshTxHistory = useCallback(async () => {
    try {
      setTxHistoryLoading(true);
      const res = await fetch("/api/transaction-history");
      const data = (await res.json()) as {
        transfers?: Array<{ txHash: string; timestamp: string; amountUsdc: string }>;
        error?: string;
        hint?: string;
      };
      if (!res.ok || data.error) {
        const msg = data.hint ? `${data.error ?? "error"}: ${data.hint}` : data.error ?? `HTTP ${res.status}`;
        setTxHistoryError(msg);
        return;
      }
      setTxHistory(data.transfers ?? []);
      setTxHistoryError(null);
      setLastHistoryRefreshAt(Date.now());
    } catch {
      setTxHistoryError("Network error loading history.");
    } finally {
      setTxHistoryLoading(false);
    }
  }, []);

  const refreshBuyerBalance = useCallback(async () => {
    try {
      const res = await fetch("/api/balance", { cache: "no-store" });
      const data = (await res.json()) as { usdcFormatted?: string | null };
      setBuyerBalance(data.usdcFormatted ?? null);
    } catch {
      setBuyerBalance(null);
    }
  }, []);

  useEffect(() => {
    const raw = window.localStorage.getItem(GOOGLE_USER_KEY);
    if (!raw) return;
    try {
      setGoogleUser(JSON.parse(raw) as GoogleUser);
    } catch {
      window.localStorage.removeItem(GOOGLE_USER_KEY);
    }
  }, []);

  useEffect(() => {
    if (googleUser || !GOOGLE_CLIENT_ID) return;
    let cancelled = false;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (cancelled || !window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: ({ credential }: { credential?: string }) => {
          const user = parseGoogleCredential(credential);
          if (!user) return;
          window.localStorage.setItem(GOOGLE_USER_KEY, JSON.stringify(user));
          setGoogleUser(user);
        },
      });
      const el = document.getElementById("google-signin");
      if (el) {
        window.google.accounts.id.renderButton(el, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
        });
      }
      setGoogleReady(true);
    };
    document.head.appendChild(script);
    return () => {
      cancelled = true;
    };
  }, [googleUser]);

  useEffect(() => {
    if (!googleUser) return;
    void refreshTxHistory();
    void refreshBuyerBalance();
    const t2 = setInterval(() => void refreshTxHistory(), 15000);
    const t3 = setInterval(() => void refreshBuyerBalance(), 15000);
    return () => {
      clearInterval(t2);
      clearInterval(t3);
    };
  }, [googleUser, refreshTxHistory, refreshBuyerBalance]);

  useEffect(() => {
    if (!googleUser) return;
    const t = setInterval(async () => {
      try {
        const agentsRes = await fetch(`${apiBaseUrl}/agents`);
        if (agentsRes.ok) {
          const data = (await agentsRes.json()) as {
            agents?: Array<{ id: string; name: string; description: string; priceUsd: string; real?: boolean }>;
          };
          if (data.agents?.length) {
            setMarketplaceCards(toMarketplaceCards(data.agents));
          }
        }
      } catch {
        // ignore
      }
    }, 4000);
    return () => clearInterval(t);
  }, [googleUser]);

  if (!googleUser) {
    return (
      <main className="min-h-screen bg-canvas text-ink">
        <AppNav current="marketplace" />
        <div className="mx-auto mt-20 max-w-md rounded-panel border border-hairline bg-surface p-6 shadow-card">
          <h1 className="text-2xl font-semibold tracking-tight">Marketplace sign-in</h1>
          <p className="mt-2 text-sm text-muted">Continue with Google to open Marketplace.</p>
          {!GOOGLE_CLIENT_ID ? (
            <p className="mt-4 rounded border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
              Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID. Add it to dashboard env, then reload.
            </p>
          ) : null}
          <div id="google-signin" className="mt-5 min-h-10" />
          {GOOGLE_CLIENT_ID && !googleReady ? <p className="mt-2 text-xs text-muted">Loading Google sign-in…</p> : null}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <AppNav current="marketplace" />
      <div className="relative mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-8">
        <section className="rounded-panel border border-hairline bg-surface p-5 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Marketplace</h1>
              <p className="mt-1 text-xs text-muted">
                Signed in as <span className="font-medium text-ink">{googleUser.email}</span> · Buyer{" "}
                <span className="font-mono text-ink">{buyerDisplayShort}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-hairline bg-raised px-3 py-1 text-xs font-medium text-ink">
                Balance: {buyerBalance ?? "—"}
              </span>
              <button
                type="button"
                onClick={() => router.push("/tools")}
                className="rounded border border-accent bg-accent px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accentPress focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Tools
              </button>
            </div>
          </div>
        </section>

        <GlobeBackground />

        <MarketplaceGrid cards={marketplaceCards} selectedId={selectedAgentId} />

        <TransactionHistory
          items={txHistory}
          loading={txHistoryLoading}
          error={txHistoryError}
          lastRefreshedAt={lastHistoryRefreshAt}
        />
      </div>
    </main>
  );
}

function parseGoogleCredential(credential?: string): GoogleUser | null {
  if (!credential) return null;
  const parts = credential.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))) as {
      email?: string;
      name?: string;
    };
    if (!payload.email) return null;
    return { email: payload.email, name: payload.name ?? payload.email };
  } catch {
    return null;
  }
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (options: { client_id: string; callback: (response: { credential?: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

function shortenAddress(address?: string): string | null {
  if (!address || address.length < 10) return null;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function toMarketplaceCards(
  apiAgents: Array<{ id: string; name: string; description: string; priceUsd: string; real?: boolean }>,
): MarketplaceCard[] {
  const mapped = apiAgents.map((agent) => ({
    id: agent.id,
    name: agent.name,
    description: agent.description,
    priceUsd: agent.priceUsd,
    real: agent.real,
  }));
  if (!mapped.some((agent) => agent.id === "wallet-risk-agent")) {
    mapped.push({
      id: "wallet-risk-agent",
      name: "Wallet Risk Agent",
      description: "Flags buyer wallet/payment risk for agent-to-agent payments.",
      priceUsd: "0.004",
      real: false,
    });
  }
  return mapped;
}
