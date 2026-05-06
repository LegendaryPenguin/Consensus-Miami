"use client";

import { motion } from "framer-motion";
import type { TollGateEvent } from "@tollgate/shared";

const STEPS = [
  { key: "connected", label: "Cursor Agent" },
  { key: "402", label: "402 Payment Required" },
  { key: "sent", label: "x402 Payment Sent" },
  { key: "verified", label: "Verified" },
  { key: "unlocked", label: "Result Unlocked" },
] as const;

function stepState(events: TollGateEvent[]) {
  const has = (types: TollGateEvent["type"][]) => events.some((e) => types.includes(e.type));
  return {
    connected: has(["cursor_request_received", "marketplace_listed"]),
    "402": has(["payment_required_402", "payment_required"]),
    sent: has(["x402_payment_submitted", "payment_signed"]),
    verified: has(["payment_verified"]),
    unlocked: has(["access_unlocked", "result_returned"]),
  };
}

type PaymentStepperProps = {
  events: TollGateEvent[];
  spentLabel: string | null;
};

export function PaymentStepper({ events, spentLabel }: PaymentStepperProps) {
  const flags = stepState(events);

  return (
    <section className="rounded-2xl border border-border bg-panel/70 p-5 shadow-card">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Live Payment</h2>
      <div className="mt-6 space-y-0">
        {STEPS.map((step, i) => {
          const done = flags[step.key as keyof typeof flags];
          const pending = !done && STEPS.slice(0, i).every((s) => flags[s.key as keyof typeof flags]);
          return (
            <div key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{ scale: pending ? 1.05 : 1 }}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${
                    done
                      ? "border-success/50 bg-success/15 text-success"
                      : pending
                        ? "border-warning/45 bg-warning/10 text-warning"
                        : "border-border bg-surface text-slate-600"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </motion.div>
                {i < STEPS.length - 1 ? (
                  <div
                    className={`my-1 h-8 w-px ${
                      flags[STEPS[i + 1].key as keyof typeof flags] ? "bg-success/40" : "bg-border"
                    }`}
                  />
                ) : null}
              </div>
              <div className="pb-6 pt-1">
                <p
                  className={`text-sm font-medium ${
                    done ? "text-slate-100" : pending ? "text-warning" : "text-slate-500"
                  }`}
                >
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {spentLabel ? (
        <p className="mt-2 border-t border-border pt-3 text-xs text-slate-400">
          Spent: <span className="font-medium text-slate-200">{spentLabel}</span>
        </p>
      ) : null}
    </section>
  );
}
