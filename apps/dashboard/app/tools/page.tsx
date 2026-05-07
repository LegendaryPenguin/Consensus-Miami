"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createEvent, createReceipt, listAgents, type PaymentReceipt, type TollGateEvent } from "@tollgate/shared";
import { AppNav } from "../../components/AppNav";
import { LivePaymentStepper } from "../../components/LivePaymentStepper";
import { ReceiptPanel } from "../../components/ReceiptPanel";

const apiBaseUrl = process.env.NEXT_PUBLIC_TOLLGATE_API_URL ?? "http://localhost:4000";

export default function ToolsPage() {
  const liveAgent = useMemo(() => listAgents().find((a) => a.id === "hackathon-research-agent") ?? listAgents()[0], []);
  const [events, setEvents] = useState<TollGateEvent[]>([]);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [result, setResult] = useState("");
  const [isLoadingFallback, setIsLoadingFallback] = useState(false);
  const [mode, setMode] = useState<"simulated" | "mock" | "x402">("simulated");
  const [apiHealth, setApiHealth] = useState<{ ok: boolean; paymentMode: string } | null>(null);
  const [copyState, setCopyState] = useState("Copy demo prompt");
  const prompt = "Use HandOff and call the Hackathon Research Agent with x402 payment.";

  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const [healthRes, eventsRes] = await Promise.all([fetch(`${apiBaseUrl}/health`), fetch(`${apiBaseUrl}/events`)]);
        if (healthRes.ok) setApiHealth((await healthRes.json()) as { ok: boolean; paymentMode: string });
        if (eventsRes.ok) {
          const data = (await eventsRes.json()) as { events?: TollGateEvent[] };
          if (data.events) setEvents(data.events);
        }
      } catch {
        setApiHealth(null);
      }
    }, 4000);
    return () => clearInterval(t);
  }, []);

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
    setResult("Simulated…");
    const steps: TollGateEvent[] = [
      createEvent({ type: "cursor_request_received", source: "dashboard", detail: "Cursor request received." }),
      createEvent({ type: "payment_required_402", source: "api", detail: "402 Payment Required returned by paid endpoint." }),
      createEvent({ type: "x402_payment_submitted", source: "mcp", detail: "x402 payment submitted." }),
      createEvent({ type: "payment_verified", source: "api", detail: "x402 Payment Verified." }),
      createEvent({ type: "access_unlocked", source: "api", detail: "Paid resource unlocked." }),
      createEvent({ type: "result_returned", source: "mcp", detail: "Result returned to Cursor." }),
      createEvent({ type: "receipt_created", source: "api", detail: "Receipt created for paid call." }),
    ];
    setEvents([]);
    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 380));
      setEvents((prev) => [...prev, step]);
    }
    setReceipt({ ...localReceipt, status: "verified" });
    setResult("Simulated answer only — not on-chain.");
  };

  const runFallbackPayment = async (paymentMode: "mock" | "x402") => {
    setMode(paymentMode);
    setIsLoadingFallback(true);
    setResult(`Running ${paymentMode}…`);
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
        setResult(`Fallback failed: ${data.error ?? `status ${res.status}`}`);
        if (data.events) setEvents(data.events);
        return;
      }
      if (data.events) setEvents(data.events);
      if (data.receipt) setReceipt(data.receipt);
      if (data.answer) setResult(data.answer);
    } catch (error) {
      setResult(`Fallback failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoadingFallback(false);
    }
  };

  const resetDemo = async () => {
    setEvents([]);
    setReceipt(null);
    setResult("");
    try {
      await fetch(`${apiBaseUrl}/demo/reset?confirm=1`, { method: "POST" });
    } catch {
      // ignore
    }
  };

  const copyPrompt = async () => {
    try {
      const response = await fetch("/api/demo-prompt");
      const data = (await response.json()) as { prompt?: string };
      await navigator.clipboard.writeText(data.prompt ?? prompt);
      setCopyState("Copied");
      setTimeout(() => setCopyState("Copy demo prompt"), 1200);
    } catch {
      setCopyState("Copy failed");
      setTimeout(() => setCopyState("Copy demo prompt"), 1200);
    }
  };

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <AppNav
        current="tools"
      />
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8">
        <div className="grid gap-6 lg:grid-cols-12">
          <section className="space-y-4 lg:col-span-7">
            <LivePaymentStepper events={events} isLive />
            <ReceiptPanel receipt={receipt} resultPreview={result || undefined} />
          </section>

          <section className="rounded-panel border border-hairline bg-surface p-5 shadow-card lg:col-span-5">
            <h1 className="text-base font-semibold tracking-tight">Tools</h1>
            <p className="mt-1 text-xs text-muted">Debug and test controls are isolated here.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void runSimulatedDemo()}
                className="rounded border border-hairline px-3 py-2 text-xs font-medium text-ink hover:bg-raised"
              >
                Simulated UI
              </button>
              <button
                type="button"
                disabled={isLoadingFallback}
                onClick={() => void runFallbackPayment("mock")}
                className="rounded border border-hairline px-3 py-2 text-xs font-medium text-ink hover:bg-raised disabled:opacity-50"
              >
                Run mock demo
              </button>
              <button
                type="button"
                disabled={isLoadingFallback}
                onClick={() => void runFallbackPayment("x402")}
                className="rounded border border-accent/40 px-3 py-2 text-xs font-medium text-accent hover:bg-accent/10 disabled:opacity-50"
              >
                Run x402 demo
              </button>
              <button
                type="button"
                onClick={() => void resetDemo()}
                className="rounded border border-hairline px-3 py-2 text-xs font-medium text-ink hover:bg-raised"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => void copyPrompt()}
                className="rounded border border-accent/40 px-3 py-2 text-xs font-medium text-accent hover:bg-accent/10"
              >
                {copyState}
              </button>
            </div>

            <details className="mt-6 rounded-panel border border-hairline bg-raised">
              <summary className="cursor-pointer select-none px-3 py-2 text-xs font-medium text-ink hover:bg-canvas/50">
                Event logs
              </summary>
              <div className="border-t border-hairline px-3 pb-3 pt-2">
                <div className="max-h-[40vh] space-y-2 overflow-y-auto rounded-md border border-hairline bg-canvas p-2">
                  {events.length === 0 ? (
                    <p className="text-xs text-muted">No events yet.</p>
                  ) : (
                    events.map((event) => (
                      <div key={event.id} className="rounded border border-hairline bg-surface p-2">
                        <p className="font-mono text-[10px] text-accent">{event.type}</p>
                        <p className="text-xs text-muted">{event.detail}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </details>

            <div className="mt-4 rounded-panel border border-hairline bg-raised p-3 text-xs text-muted">
              API health: <span className="text-ink">{apiHealth ? JSON.stringify(apiHealth) : "unavailable"}</span>
              <br />
              Last mode: <span className="text-ink">{mode}</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
