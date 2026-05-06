"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  createEvent,
  createReceipt,
  listAgents,
  type PaymentReceipt,
  type TollGateEvent,
} from "@tollgate/shared";

const initialEvents: TollGateEvent[] = [];
const apiBaseUrl = process.env.NEXT_PUBLIC_TOLLGATE_API_URL ?? "http://localhost:4000";

export default function Page() {
  const liveAgentId = "hackathon-research-agent";
  const marketplaceCards = useMemo(
    () => [
      {
        id: "hackathon-research-agent",
        name: "Hackathon Research Agent",
        priceUsd: "0.003",
        status: "Live",
        description: "Finds sponsor-aligned hackathon ideas and explains the strongest build path.",
      },
      {
        id: "pitch-agent",
        name: "Pitch Agent",
        priceUsd: "0.002",
        status: "Demo",
        description: "Turns rough ideas into judge-ready pitch language.",
      },
      {
        id: "code-review-agent",
        name: "Code Review Agent",
        priceUsd: "0.005",
        status: "Demo",
        description: "Reviews technical architecture and repo quality.",
      },
      {
        id: "wallet-risk-agent",
        name: "Wallet Risk Agent",
        priceUsd: "0.004",
        status: "Demo",
        description: "Flags buyer wallet/payment risk for agent-to-agent payments.",
      },
    ],
    [],
  );
  const sharedAgents = useMemo(() => listAgents(), []);
  const liveAgent = useMemo(
    () => sharedAgents.find((agent) => agent.id === liveAgentId) ?? sharedAgents[0],
    [sharedAgents],
  );
  const [events, setEvents] = useState<TollGateEvent[]>(initialEvents);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [result, setResult] = useState("No paid result yet.");
  const [isLoadingFallback, setIsLoadingFallback] = useState(false);
  const [selectedAgentId] = useState(liveAgentId);
  const [prompt] = useState('Use TollGate Bazaar and call the Hackathon Research Agent with x402 payment.');

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

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/events`);
        if (!res.ok) return;
        const data = (await res.json()) as { events?: TollGateEvent[] };
        if (data.events && data.events.length > 0) {
          setEvents(data.events);
        }
      } catch {
        // Keep dashboard standalone when API isn't running.
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const timelineStates = useMemo(
    () => [
      { label: "Waiting for Cursor request", active: events.length === 0 },
      { label: "Cursor Agent connected", active: hasEvent(events, ["cursor_request_received", "marketplace_listed"]) },
      { label: "Paid agent selected", active: hasEvent(events, ["agent_selected"]) },
      { label: "402 Payment Required", active: hasEvent(events, ["payment_required_402", "payment_required"]) },
      { label: "x402 payment submitted", active: hasEvent(events, ["x402_payment_submitted", "payment_signed"]) },
      { label: "Payment verified", active: hasEvent(events, ["payment_verified"]) },
      { label: "Access unlocked", active: hasEvent(events, ["access_unlocked"]) },
      { label: "Result returned to Cursor", active: hasEvent(events, ["result_returned"]) },
    ],
    [events],
  );

  const lastAnswer = result;
  const buyerLabel = shortenAddress(receipt?.buyerAddress) ?? "Cursor Agent";
  const sellerLabel = shortenAddress(receipt?.sellerAddress) ?? "Hackathon Research Agent";

  return (
    <main className="min-h-screen bg-bg px-6 py-8 text-slate-100">
      <h1 className="mb-2 text-3xl font-semibold">TollGate Bazaar</h1>
      <p className="mb-2 text-sm text-slate-300">Cursor-style agents can buy specialist help on demand with x402.</p>
      <p className="mb-6 text-xs text-slate-400">{prompt}</p>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-line/30 bg-panel p-5">
          <h2 className="mb-3 text-lg font-semibold">1. Marketplace</h2>
          <div className="space-y-2">
            {marketplaceCards.map((agent) => (
              <div
                key={agent.id}
                className={`rounded-lg border p-3 ${
                  agent.id === selectedAgentId ? "border-glow/70 bg-glow/10" : "border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{agent.name}</p>
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      agent.status === "Live" ? "bg-emerald-600/30 text-emerald-200" : "bg-slate-700 text-slate-200"
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-300">{agent.description}</p>
                <p className="mt-1 text-xs text-line">${agent.priceUsd} / call</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-line/30 bg-panel p-5">
          <h2 className="mb-3 text-lg font-semibold">2. Live Transaction Timeline</h2>
          <div className="space-y-2 rounded-xl border border-slate-700/70 bg-slate-950/40 p-3">
            {timelineStates.map((state) => (
              <div
                key={state.label}
                className={`rounded-md border px-3 py-2 text-sm ${
                  state.active ? "border-glow/80 bg-glow/15 text-slate-100" : "border-slate-700 text-slate-400"
                }`}
              >
                {state.label}
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            {events.slice(-6).map((event) => (
              <motion.div key={event.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-md border border-slate-700 p-2">
                <p className="text-xs uppercase text-line">{event.type}</p>
                <p className="text-sm">{event.detail}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-line/30 bg-panel p-5">
          <h2 className="mb-3 text-lg font-semibold">3. Receipt</h2>
          {receipt ? (
            <div className="space-y-1 text-sm">
              <p>Buyer: Cursor Agent</p>
              <p>Seller: Hackathon Research Agent</p>
              <p>Price: {receipt.priceUsd} USDC</p>
              <p>Network: Base Sepolia</p>
              <p>Payment Mode: {receipt.paymentMode}</p>
              <p>Status: {receipt.status}</p>
              <p>Receipt ID: {receipt.id}</p>
              <p>Timestamp: {new Date(receipt.createdAt).toLocaleString()}</p>
              <p>Buyer wallet: {buyerLabel}</p>
              <p>Seller wallet: {sellerLabel}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No receipt yet.</p>
          )}
        </section>

        <section className="rounded-xl border border-line/30 bg-panel p-5">
          <h2 className="mb-3 text-lg font-semibold">4. Final Answer</h2>
          <p className="text-sm">{lastAnswer}</p>
        </section>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={runSimulatedDemo}
          className="rounded-lg border border-line bg-line/10 px-4 py-2 text-sm font-medium hover:bg-line/20"
        >
          Run Simulated Demo
        </button>
        <button
          disabled={isLoadingFallback}
          onClick={() => runFallbackPayment("mock")}
          className="rounded-lg border border-line bg-line/10 px-4 py-2 text-sm font-medium hover:bg-line/20 disabled:opacity-60"
        >
          Call Paid Agent
        </button>
        <button
          disabled={isLoadingFallback}
          onClick={() => runFallbackPayment("x402")}
          className="rounded-lg border border-glow bg-glow/15 px-4 py-2 text-sm font-medium hover:bg-glow/25 disabled:opacity-60"
        >
          Pay with x402 Testnet
        </button>
      </div>
    </main>
  );
}

function hasEvent(events: TollGateEvent[], eventTypes: Array<TollGateEvent["type"]>): boolean {
  return events.some((event) => eventTypes.includes(event.type));
}

function shortenAddress(address?: string): string | null {
  if (!address || address.length < 10) return null;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
