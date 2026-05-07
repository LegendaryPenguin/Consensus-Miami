"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import type { PaymentReceipt, TollGateEvent } from "@tollgate/shared";

type DeveloperDrawerProps = {
  open: boolean;
  onClose: () => void;
  apiBaseUrl: string;
  events: TollGateEvent[];
  apiHealth: { ok: boolean; paymentMode: string } | null;
  eventConnection: "connected" | "disconnected";
  mode: "simulated" | "mock" | "x402";
  copyState: string;
  isLoadingFallback: boolean;
  onReset: () => void;
  onCopyPrompt: () => void;
  onRunSimulated: () => void;
  onRunMock: () => void;
  onRunX402: () => void;
  onLoadWalletBalances: () => void;
  receipt: PaymentReceipt | null;
  walletBalancesRaw: string;
  walletBalancesLoading: boolean;
};

export function DeveloperDrawer({
  open,
  onClose,
  apiBaseUrl,
  events,
  apiHealth,
  eventConnection,
  mode,
  copyState,
  isLoadingFallback,
  onReset,
  onCopyPrompt,
  onRunSimulated,
  onRunMock,
  onRunX402,
  onLoadWalletBalances,
  receipt,
  walletBalancesRaw,
  walletBalancesLoading,
}: DeveloperDrawerProps) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const drawerTransition = reduceMotion
    ? { duration: 0.15 }
    : { type: "spring" as const, damping: 32, stiffness: 380 };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close tools panel"
            className="fixed inset-0 z-40 bg-canvas/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.1 : 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="tools-drawer-title"
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-lg flex-col border-l border-hairline bg-surface shadow-card"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={drawerTransition}
          >
            <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
              <h2 id="tools-drawer-title" className="text-sm font-semibold text-ink">
                Tools
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded border border-transparent px-2 py-1 text-xs text-muted hover:border-hairline hover:text-ink"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <p className="text-xs text-muted">API base URL</p>
              <p className="break-all font-mono text-xs text-ink">{apiBaseUrl}</p>

              <div className="mt-4 rounded-panel border border-hairline bg-raised p-3">
                <p className="text-xs font-medium text-muted">API health</p>
                <pre className="mt-2 max-h-32 overflow-auto text-[11px] text-ink">
                  {apiHealth ? JSON.stringify(apiHealth, null, 2) : "—"}
                </pre>
              </div>

              <div className="mt-4 grid gap-2 text-xs text-muted">
                <p>
                  Last fallback mode: <span className="text-ink">{mode}</span>
                </p>
                <p>
                  Event log: <span className="text-ink">{eventConnection}</span>
                </p>
                {receipt ? (
                  <p>
                    Last receipt: <span className="font-mono text-ink">{receipt.status}</span>
                  </p>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onReset}
                  className="rounded border border-hairline bg-raised px-3 py-2 text-xs font-medium text-ink hover:border-muted/50"
                >
                  Reset API demo state
                </button>
                <button
                  type="button"
                  onClick={onCopyPrompt}
                  className="rounded border border-accent/40 bg-accent/10 px-3 py-2 text-xs font-medium text-accent hover:bg-accent/20"
                >
                  {copyState}
                </button>
              </div>

              <p className="mt-3 text-[11px] leading-relaxed text-muted">
                Fallback flows hit your Next.js server and sign only if you configured a buyer key there. Prefer MCP in
                Cursor or Kiro with a local key.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onRunSimulated}
                  className="rounded border border-hairline px-3 py-2 text-xs font-medium text-ink hover:bg-raised"
                >
                  Simulated UI
                </button>
                <button
                  type="button"
                  disabled={isLoadingFallback}
                  onClick={onRunMock}
                  className="rounded border border-hairline px-3 py-2 text-xs font-medium text-ink hover:bg-raised disabled:opacity-50"
                >
                  Test mock API
                </button>
                <button
                  type="button"
                  disabled={isLoadingFallback}
                  onClick={onRunX402}
                  className="rounded border border-accent/40 px-3 py-2 text-xs font-medium text-accent hover:bg-accent/10 disabled:opacity-50"
                >
                  Test x402 via fallback
                </button>
                <button
                  type="button"
                  disabled={walletBalancesLoading}
                  onClick={onLoadWalletBalances}
                  className="rounded border border-hairline px-3 py-2 text-xs font-medium text-ink hover:bg-raised disabled:opacity-50"
                >
                  {walletBalancesLoading ? "Loading…" : "Raw wallet balances"}
                </button>
              </div>

              <div className="mt-4 rounded-panel border border-hairline bg-raised p-3">
                <p className="text-xs font-medium text-muted">Raw balances (JSON)</p>
                <pre className="mt-2 max-h-48 overflow-auto text-[11px] text-ink">
                  {walletBalancesRaw || "Tap “Raw wallet balances” to load."}
                </pre>
              </div>

              <details className="mt-6 rounded-panel border border-hairline bg-raised">
                <summary className="cursor-pointer select-none px-3 py-2 text-xs font-medium text-ink hover:bg-canvas/50">
                  Developer logs
                  <span className="ml-2 text-muted">(raw /events)</span>
                </summary>
                <div className="border-t border-hairline px-3 pb-3 pt-2">
                  <p className="text-[11px] text-muted">Collapsed by default. Open to inspect API event payloads.</p>
                  <div className="mt-2 max-h-[40vh] space-y-2 overflow-y-auto rounded-md border border-hairline bg-canvas p-2">
                    {events.length === 0 ? (
                      <p className="text-xs text-muted">No events yet.</p>
                    ) : (
                      events.map((event) => (
                        <div key={event.id} className="rounded border border-hairline bg-surface p-2">
                          <p className="font-mono text-[10px] text-accent">{event.type}</p>
                          <p className="text-xs text-muted">{event.detail}</p>
                          <pre className="mt-1 max-h-24 overflow-auto text-[10px] text-muted/90">
                            {JSON.stringify(event, null, 0)}
                          </pre>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </details>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
