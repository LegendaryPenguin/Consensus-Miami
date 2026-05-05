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

const finalAnswer =
  "The strongest Coinbase x AWS x402 project is a paid Agent Reliability Copilot that sells incident triage, deploy rollback advice, and postmortem drafts to other agents via x402 pay-per-call.";

export default function Page() {
  const agents = useMemo(() => listAgents(), []);
  const [events, setEvents] = useState<TollGateEvent[]>(initialEvents);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [result, setResult] = useState("No paid result yet.");
  const [prompt] = useState(
    'Use TollGate to call a paid hackathon research agent and ask what the strongest Coinbase x AWS x402 project is.',
  );

  const runDemo = async () => {
    const mainAgent = agents[0];
    const localReceipt = createReceipt({
      agentId: mainAgent.id,
      agentName: mainAgent.name,
      endpoint: mainAgent.endpoint,
      paymentMode: "mock",
      network: "eip155:84532",
      priceUsd: mainAgent.priceUsd,
      buyerAddress: "0xBuyerDemo",
      sellerAddress: "0xSellerDemo",
      status: "pending",
    });

    setReceipt(localReceipt);
    setResult("Awaiting paid specialist response...");

    const steps: TollGateEvent[] = [
      createEvent({ type: "request_received", source: "dashboard", detail: "Cursor prompt received." }),
      createEvent({ type: "marketplace_lookup", source: "dashboard", detail: "TollGate selected Hackathon Research Agent." }),
      createEvent({ type: "payment_required", source: "api", detail: "402 Payment Required returned by paid endpoint." }),
      createEvent({ type: "payment_signed", source: "mcp", detail: "Mock x402 payment signed by buyer wallet." }),
      createEvent({ type: "payment_verified", source: "api", detail: "Payment verified by seller endpoint." }),
      createEvent({ type: "access_unlocked", source: "api", detail: "Paid resource unlocked." }),
      createEvent({ type: "result_returned", source: "mcp", detail: "Paid specialist result returned to Cursor." }),
    ];

    setEvents([]);
    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 450));
      setEvents((prev) => [...prev, step]);
    }

    setReceipt({ ...localReceipt, status: "verified" });
    setResult(finalAnswer);
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:4000/events");
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

  return (
    <main className="min-h-screen bg-bg px-6 py-8 text-slate-100">
      <h1 className="mb-2 text-3xl font-semibold">TollGate Bazaar</h1>
      <p className="mb-6 text-sm text-slate-300">Agent commerce gateway with x402 payment timeline.</p>

      <div className="mb-4 rounded-xl border border-line/40 bg-panel p-4 shadow-glow">
        <p className="text-xs uppercase tracking-widest text-line">Cursor Agent Panel</p>
        <p className="mt-2 text-sm">{prompt}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <section className="rounded-xl border border-line/30 bg-panel p-4">
          <h2 className="mb-3 text-lg">Tool Marketplace</h2>
          <div className="space-y-2">
            {agents.map((agent) => (
              <div key={agent.id} className="rounded-lg border border-slate-700 p-3">
                <p className="font-medium">{agent.name}</p>
                <p className="text-xs text-slate-300">{agent.description}</p>
                <p className="mt-1 text-xs text-line">${agent.priceUsd} / call</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-line/30 bg-panel p-4">
          <h2 className="mb-3 text-lg">x402 Payment Timeline</h2>
          <div className="space-y-2">
            {events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-md border border-slate-700 p-2"
              >
                <p className="text-xs uppercase text-line">{event.type}</p>
                <p className="text-sm">{event.detail}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-line/30 bg-panel p-4">
          <h2 className="mb-3 text-lg">Receipt Panel</h2>
          {receipt ? (
            <div className="space-y-1 text-sm">
              <p>Status: {receipt.status}</p>
              <p>Price: ${receipt.priceUsd}</p>
              <p>Network: {receipt.network}</p>
              <p>Buyer: {receipt.buyerAddress}</p>
              <p>Seller: {receipt.sellerAddress}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No receipt yet.</p>
          )}
        </section>
      </div>

      <section className="mt-4 rounded-xl border border-line/30 bg-panel p-4">
        <h2 className="mb-3 text-lg">Final Result Panel</h2>
        <p className="text-sm">{result}</p>
      </section>

      <button
        onClick={runDemo}
        className="mt-6 rounded-lg border border-line bg-line/10 px-4 py-2 text-sm font-medium hover:bg-line/20"
      >
        Run Simulated Demo
      </button>
    </main>
  );
}
