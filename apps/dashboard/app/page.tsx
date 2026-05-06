"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createEvent,
  createReceipt,
  listAgents,
  type PaymentReceipt,
  type TollGateEvent,
} from "@tollgate/shared";
import { DeveloperDrawer } from "../components/DeveloperDrawer";
import { MarketplaceGrid, type MarketplaceCard } from "../components/MarketplaceGrid";
import { PaidResultCard } from "../components/PaidResultCard";
import { PaymentStepper } from "../components/PaymentStepper";
import { TopBar } from "../components/TopBar";
import { TransactionHistory } from "../components/TransactionHistory";

const initialEvents: TollGateEvent[] = [];
const apiBaseUrl = process.env.NEXT_PUBLIC_TOLLGATE_API_URL ?? "http://localhost:4000";
const defaultPaymentMode = (process.env.NEXT_PUBLIC_PAYMENT_MODE ?? "mock").toLowerCase();

export default function Page() {
  const liveAgentId = "hackathon-research-agent";
  const sharedAgents = useMemo(() => listAgents(), []);
  const [marketplaceCards, setMarketplaceCards] = useState<MarketplaceCard[]>(() => toMarketplaceCards(sharedAgents));
  const liveAgent = useMemo(
    () =>
      marketplaceCards.find((agent) => agent.id === liveAgentId)
        ? sharedAgents.find((agent) => agent.id === liveAgentId) ?? sharedAgents[0]
        : sharedAgents[0],
    [marketplaceCards, sharedAgents],
  );
  const [events, setEvents] = useState<TollGateEvent[]>(initialEvents);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [result, setResult] = useState("No paid result yet.");
  const [isLoadingFallback, setIsLoadingFallback] = useState(false);
  const [mode, setMode] = useState<"simulated" | "mock" | "x402">("simulated");
  const [apiHealth, setApiHealth] = useState<{ ok: boolean; paymentMode: string } | null>(null);
  const [eventConnection, setEventConnection] = useState<"connected" | "disconnected">("disconnected");
  const [copyState, setCopyState] = useState("Copy Cursor Demo Prompt");
  const [selectedAgentId] = useState(liveAgentId);
  const [prompt] = useState("Use TollGate Bazaar and call the Hackathon Research Agent with x402 payment.");
  const [devOpen, setDevOpen] = useState(false);
  const [balanceChip, setBalanceChip] = useState<string | null>(null);
  const [balanceAddressShort, setBalanceAddressShort] = useState<string | null>(null);
  const [walletBalancesRaw, setWalletBalancesRaw] = useState("");
  const [walletBalancesLoading, setWalletBalancesLoading] = useState(false);
  const [txHistory, setTxHistory] = useState<Array<{ txHash: string; timestamp: string; amountUsdc: string }>>([]);
  const [txHistoryLoading, setTxHistoryLoading] = useState(true);
  const [txHistoryError, setTxHistoryError] = useState<string | null>(null);

  const buyerDisplayShort = useMemo(() => {
    const env = process.env.NEXT_PUBLIC_BUYER_WALLET_ADDRESS?.trim();
    if (env && /^0x[a-fA-F0-9]{40}$/i.test(env)) return shortenAddress(env) ?? env.slice(0, 10);
    if (balanceAddressShort) return balanceAddressShort;
    return shortenAddress(receipt?.buyerAddress) ?? "configure buyer";
  }, [balanceAddressShort, receipt?.buyerAddress]);

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

  useEffect(() => {
    void refreshBalance();
    const t = setInterval(() => void refreshBalance(), 15000);
    return () => clearInterval(t);
  }, [refreshBalance]);

  const refreshTxHistory = useCallback(async () => {
    try {
      setTxHistoryLoading(true);
      const res = await fetch("/api/transaction-history");
      const data = (await res.json()) as {
        transfers?: Array<{ txHash: string; timestamp: string; amountUsdc: string }>;
        error?: string;
      };
      if (!res.ok || data.error) {
        setTxHistoryError("Transaction history unavailable. Check buyer/seller env vars.");
        return;
      }
      setTxHistory(data.transfers ?? []);
      setTxHistoryError(null);
    } catch {
      setTxHistoryError("Transaction history unavailable.");
    } finally {
      setTxHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshTxHistory();
    const t = setInterval(() => void refreshTxHistory(), 15000);
    return () => clearInterval(t);
  }, [refreshTxHistory]);

  const runSimulatedDemo = async () => {
    if (!liveAgent) return;
    const localReceipt = createReceipt({
      agentId: liveAgent.id,
      agentName: liveAgent.name,
      endpoint: liveAgent.endpoint,
      paymentMode: "mock",
      network: "eip155:84532",
      priceUsd: liveAgent.priceUsd,
      buyerAddress: "0x3c8B51E023E669aBb27f197537A30E95C058e5b6",
      sellerAddress: "0x4E2BCF514DCB6Fb56751913233404409b5De3818",
      status: "pending",
    });

    setReceipt(localReceipt);
    setMode("simulated");
    setResult("Awaiting paid specialist response in simulated mode...");

    const steps: TollGateEvent[] = [
      createEvent({ type: "cursor_request_received", source: "dashboard", detail: "Cursor request received." }),
      createEvent({ type: "marketplace_listed", source: "dashboard", detail: "Cursor Agent connected to marketplace." }),
      createEvent({ type: "agent_selected", source: "dashboard", detail: "Paid agent selected: Hackathon Research Agent." }),
      createEvent({ type: "payment_required_402", source: "api", detail: "402 Payment Required returned by paid endpoint." }),
      createEvent({ type: "x402_payment_submitted", source: "mcp", detail: "x402 payment submitted." }),
      createEvent({ type: "payment_verified", source: "api", detail: "x402 Payment Verified." }),
      createEvent({ type: "access_unlocked", source: "api", detail: "Paid resource unlocked." }),
      createEvent({ type: "result_returned", source: "mcp", detail: "Result returned to Cursor." }),
      createEvent({ type: "receipt_created", source: "api", detail: "Receipt created for paid call." }),
    ];

    setEvents([]);
    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 450));
      setEvents((prev) => [...prev, step]);
    }

    setReceipt({ ...localReceipt, status: "verified" });
    setResult(
      "Strongest project: Agent Commerce Command Center using x402 pay-per-call specialist agents, with Coinbase payment rails and AWS-hosted orchestration.",
    );
  };

  const runFallbackPayment = async (paymentMode: "mock" | "x402") => {
    setMode(paymentMode);
    setIsLoadingFallback(true);
    setResult(`Running ${paymentMode} payment flow...`);
    try {
      const res = await fetch("/api/fallback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMode,
          question: "What is the strongest Coinbase x AWS x402 hackathon project we can build quickly?",
        }),
      });
      const data = (await res.json()) as {
        answer?: string;
        receipt?: PaymentReceipt;
        events?: TollGateEvent[];
        error?: string;
      };

      if (!res.ok || data.error) {
        setResult(`Fallback flow failed: ${data.error ?? `status ${res.status}`}`);
        if (data.events) setEvents(data.events);
        return;
      }

      if (data.events) setEvents(data.events);
      if (data.receipt) setReceipt(data.receipt);
      if (data.answer) setResult(data.answer);
    } catch (error) {
      setResult(`Fallback flow failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoadingFallback(false);
    }
  };

  const runTopBarDemo = () => {
    if (defaultPaymentMode === "x402") {
      void runFallbackPayment("x402");
    } else {
      void runFallbackPayment("mock");
    }
  };

  const loadWalletBalances = async () => {
    setWalletBalancesLoading(true);
    try {
      const res = await fetch("/api/wallet-balances");
      const data = (await res.json()) as Record<string, unknown>;
      setWalletBalancesRaw(JSON.stringify(data, null, 2));
    } catch (error) {
      setWalletBalancesRaw(
        JSON.stringify(
          {
            error: error instanceof Error ? error.message : String(error),
          },
          null,
          2,
        ),
      );
    } finally {
      setWalletBalancesLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [eventsRes, healthRes] = await Promise.all([
          fetch(`${apiBaseUrl}/events`),
          fetch(`${apiBaseUrl}/health`),
        ]);
        if (eventsRes.ok) {
          const data = (await eventsRes.json()) as { events?: TollGateEvent[] };
          if (data.events && data.events.length > 0) {
            setEvents(data.events);
          }
          setEventConnection("connected");
        } else {
          setEventConnection("disconnected");
        }
        if (healthRes.ok) {
          const data = (await healthRes.json()) as { ok: boolean; paymentMode: string };
          setApiHealth(data);
        }
        const agentsRes = await fetch(`${apiBaseUrl}/agents`);
        if (agentsRes.ok) {
          const data = (await agentsRes.json()) as {
            agents?: Array<{ id: string; name: string; description: string; priceUsd: string }>;
          };
          if (data.agents?.length) {
            setMarketplaceCards(toMarketplaceCards(data.agents));
          }
        }
      } catch {
        setEventConnection("disconnected");
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const buyerLabel = shortenAddress(receipt?.buyerAddress) ?? "Buyer";
  const sellerLabel = shortenAddress(receipt?.sellerAddress) ?? "Seller";

  const spentLabel = receipt ? `${receipt.priceUsd} USDC` : null;

  const isPaidComplete =
    hasEvent(events, ["result_returned"]) ||
    (receipt?.status === "verified" && !isWaitingResultCopy(result));

  const resetDemo = async () => {
    setEvents([]);
    setReceipt(null);
    setResult("No paid result yet.");
    try {
      await fetch(`${apiBaseUrl}/demo/reset?confirm=1`, { method: "POST" });
    } catch {
      // keep local reset even when API is unavailable
    }
  };

  const copyPrompt = async () => {
    try {
      const response = await fetch("/api/demo-prompt");
      const data = (await response.json()) as { prompt?: string };
      await navigator.clipboard.writeText(data.prompt ?? prompt);
      setCopyState("Prompt copied");
      setTimeout(() => setCopyState("Copy Cursor Demo Prompt"), 1200);
    } catch {
      setCopyState("Copy failed");
      setTimeout(() => setCopyState("Copy Cursor Demo Prompt"), 1200);
    }
  };

  const balanceLabel = balanceChip;

  return (
    <main className="min-h-screen bg-bg px-4 py-6 text-slate-100 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <TopBar
          balanceLabel={balanceLabel}
          addressShort={buyerDisplayShort}
          isLoadingDemo={isLoadingFallback}
          onRunDemo={runTopBarDemo}
          onOpenDeveloper={() => setDevOpen(true)}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <MarketplaceGrid cards={marketplaceCards} selectedId={selectedAgentId} />
          <PaymentStepper events={events} spentLabel={spentLabel} />
        </div>

        <PaidResultCard
          answer={result}
          receipt={receipt}
          buyerShort={buyerLabel}
          sellerShort={sellerLabel}
          isComplete={isPaidComplete}
        />
        <TransactionHistory items={txHistory} loading={txHistoryLoading} error={txHistoryError} />
      </div>

      <DeveloperDrawer
        open={devOpen}
        onClose={() => setDevOpen(false)}
        apiBaseUrl={apiBaseUrl}
        events={events}
        apiHealth={apiHealth}
        eventConnection={eventConnection}
        mode={mode}
        copyState={copyState}
        isLoadingFallback={isLoadingFallback}
        onReset={() => void resetDemo()}
        onCopyPrompt={() => void copyPrompt()}
        onRunSimulated={() => void runSimulatedDemo()}
        onRunMock={() => void runFallbackPayment("mock")}
        onRunX402={() => void runFallbackPayment("x402")}
        onLoadWalletBalances={() => void loadWalletBalances()}
        receipt={receipt}
        walletBalancesRaw={walletBalancesRaw}
        walletBalancesLoading={walletBalancesLoading}
      />
    </main>
  );
}

function hasEvent(events: TollGateEvent[], eventTypes: Array<TollGateEvent["type"]>): boolean {
  return events.some((event) => eventTypes.includes(event.type));
}

function isWaitingResultCopy(message: string) {
  return (
    message === "No paid result yet." ||
    message.startsWith("Running ") ||
    message.startsWith("Fallback flow failed") ||
    message.startsWith("Awaiting paid specialist")
  );
}

function shortenAddress(address?: string): string | null {
  if (!address || address.length < 10) return null;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function toMarketplaceCards(
  apiAgents: Array<{ id: string; name: string; description: string; priceUsd: string }>,
): MarketplaceCard[] {
  const mapped = apiAgents.map((agent) => ({
    ...agent,
    status: (agent.id === "hackathon-research-agent" ? "Live" : "Demo") as "Live" | "Demo",
  }));
  if (!mapped.some((agent) => agent.id === "wallet-risk-agent")) {
    mapped.push({
      id: "wallet-risk-agent",
      name: "Wallet Risk Agent",
      description: "Flags buyer wallet/payment risk for agent-to-agent payments.",
      priceUsd: "0.004",
      status: "Demo",
    });
  }
  return mapped;
}
