"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { listAgents } from "@tollgate/shared";
import { useRouter } from "next/navigation";
import { MarketplaceGrid, type MarketplaceCard } from "../../components/MarketplaceGrid";
import { TopBar } from "../../components/TopBar";
import { TransactionHistory } from "../../components/TransactionHistory";
import { GlobeBackground } from "../../components/GlobeBackground";

const apiBaseUrl = process.env.NEXT_PUBLIC_TOLLGATE_API_URL ?? "http://localhost:4000";

const networkLabel =
  process.env.NEXT_PUBLIC_X402_NETWORK === "eip155:84532" || !process.env.NEXT_PUBLIC_X402_NETWORK
    ? "Base Sepolia"
    : (process.env.NEXT_PUBLIC_X402_NETWORK ?? "L2");

export default function MarketplacePage() {
  const router = useRouter();
  const sharedAgents = useMemo(() => listAgents(), []);
  const [marketplaceCards, setMarketplaceCards] = useState<MarketplaceCard[]>(() => toMarketplaceCards(sharedAgents));
  const [selectedAgentId] = useState("hackathon-research-agent");
  const [balanceChip, setBalanceChip] = useState<string | null>(null);
  const [balanceAddressShort, setBalanceAddressShort] = useState<string | null>(null);
  const [apiHealth, setApiHealth] = useState<{ ok: boolean; paymentMode: string } | null>(null);
  const [txHistory, setTxHistory] = useState<Array<{ txHash: string; timestamp: string; amountUsdc: string }>>([]);
  const [txHistoryLoading, setTxHistoryLoading] = useState(true);
  const [txHistoryError, setTxHistoryError] = useState<string | null>(null);
  const [lastHistoryRefreshAt, setLastHistoryRefreshAt] = useState<number | null>(null);

  const buyerDisplayShort = useMemo(() => {
    const env = process.env.NEXT_PUBLIC_BUYER_WALLET_ADDRESS?.trim();
    if (env && /^0x[a-fA-F0-9]{40}$/i.test(env)) return shortenAddress(env) ?? env.slice(0, 10);
    if (balanceAddressShort) return balanceAddressShort;
    return "configure buyer";
  }, [balanceAddressShort]);

  const refreshBalance = useCallback(async () => {
    try {
      const res = await fetch("/api/balance");
      const data = (await res.json()) as {
        usdcFormatted?: string | null;
        addressShort?: string | null;
      };
      setBalanceChip(data.usdcFormatted ?? null);
      setBalanceAddressShort(data.addressShort ?? null);
    } catch {
      setBalanceChip(null);
    }
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

  useEffect(() => {
    void refreshBalance();
    void refreshTxHistory();
    const t1 = setInterval(() => void refreshBalance(), 15000);
    const t2 = setInterval(() => void refreshTxHistory(), 15000);
    return () => {
      clearInterval(t1);
      clearInterval(t2);
    };
  }, [refreshBalance, refreshTxHistory]);

  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const [healthRes, agentsRes] = await Promise.all([
          fetch(`${apiBaseUrl}/health`),
          fetch(`${apiBaseUrl}/agents`),
        ]);
        if (healthRes.ok) {
          const data = (await healthRes.json()) as { ok: boolean; paymentMode: string };
          setApiHealth(data);
        } else {
          setApiHealth(null);
        }
        if (agentsRes.ok) {
          const data = (await agentsRes.json()) as {
            agents?: Array<{ id: string; name: string; description: string; priceUsd: string; real?: boolean }>;
          };
          if (data.agents?.length) {
            setMarketplaceCards(toMarketplaceCards(data.agents));
          }
        }
      } catch {
        setApiHealth(null);
      }
    }, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="relative min-h-screen bg-canvas px-4 py-8 text-ink md:px-8">
      <GlobeBackground />
      <div className="relative mx-auto max-w-6xl space-y-8">
        <TopBar
          balanceLabel={balanceChip}
          addressShort={buyerDisplayShort}
          networkLabel={networkLabel}
          paymentModeLabel={apiHealth?.paymentMode ?? null}
          apiOk={apiHealth?.ok ?? null}
          onOpenTools={() => router.push("/tools")}
        />

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
