"use client";

import { AnimatePresence, motion } from "framer-motion";
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
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close developer panel"
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="dev-drawer-title"
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-lg flex-col border-l border-border bg-surface shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 id="dev-drawer-title" className="text-sm font-semibold text-slate-100">
                Developer
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <p className="text-xs text-slate-500">Public API URL</p>
              <p className="break-all font-mono text-xs text-slate-300">{apiBaseUrl}</p>

              <div className="mt-4 rounded-xl border border-border bg-panel/80 p-3">
                <p className="text-xs font-semibold text-slate-400">API health</p>
                <pre className="mt-2 max-h-32 overflow-auto text-[11px] text-slate-300">
                  {apiHealth ? JSON.stringify(apiHealth, null, 2) : "—"}
                </pre>
              </div>

              <div className="mt-4 grid gap-2 text-xs text-slate-400">
                <p>
                  Mode: <span className="text-slate-200">{mode}</span>
                </p>
                <p>
                  Events: <span className="text-slate-200">{eventConnection}</span>
                </p>
                {receipt ? (
                  <p>
                    Receipt status: <span className="text-slate-200">{receipt.status}</span>
                  </p>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onReset}
                  className="rounded-lg border border-border bg-slate-800/50 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
                >
                  Reset Demo
                </button>
                <button
                  type="button"
                  onClick={onCopyPrompt}
                  className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-xs font-medium text-accent hover:bg-accent/20"
                >
                  {copyState}
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onRunSimulated}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-slate-300 hover:border-slate-500"
                >
                  Simulated
                </button>
                <button
                  type="button"
                  disabled={isLoadingFallback}
                  onClick={onRunMock}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-slate-300 hover:border-slate-500 disabled:opacity-50"
                >
                  Mock API
                </button>
                <button
                  type="button"
                  disabled={isLoadingFallback}
                  onClick={onRunX402}
                  className="rounded-lg border border-accent/40 px-3 py-2 text-xs font-medium text-accent hover:bg-accent/10 disabled:opacity-50"
                >
                  Real x402
                </button>
                <button
                  type="button"
                  disabled={walletBalancesLoading}
                  onClick={onLoadWalletBalances}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-slate-300 hover:border-slate-500 disabled:opacity-50"
                >
                  {walletBalancesLoading ? "Loading balances..." : "Raw Wallet Balances"}
                </button>
              </div>

              <div className="mt-4 rounded-xl border border-border bg-panel/80 p-3">
                <p className="text-xs font-semibold text-slate-400">Buyer/Seller raw wallet balances</p>
                <pre className="mt-2 max-h-48 overflow-auto text-[11px] text-slate-300">
                  {walletBalancesRaw || "Click `Raw Wallet Balances` to load."}
                </pre>
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Raw /events tail</p>
                <div className="mt-2 max-h-[40vh] space-y-2 overflow-y-auto rounded-xl border border-border bg-black/30 p-3">
                  {events.length === 0 ? (
                    <p className="text-xs text-slate-600">No events yet.</p>
                  ) : (
                    events.map((event) => (
                      <div key={event.id} className="rounded-lg border border-border/60 bg-panel/50 p-2">
                        <p className="font-mono text-[10px] uppercase text-accent">{event.type}</p>
                        <p className="text-xs text-slate-400">{event.detail}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
