"use client";

import { Check, Circle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { TollGateEvent } from "@tollgate/shared";

const STEPS = [
  { id: "request", label: "Request", match: (t: string) =>
      ["cursor_request_received", "agent_selected", "unpaid_request_sent", "marketplace_listed"].includes(t) },
  { id: "402", label: "402", match: (t: string) => ["payment_required_402", "payment_required"].includes(t) },
  { id: "pay", label: "Pay", match: (t: string) =>
      ["x402_payment_submitted", "payment_signed", "mock_payment_detected"].includes(t) },
  { id: "verify", label: "Verify", match: (t: string) => t === "payment_verified" },
  { id: "unlock", label: "Unlock", match: (t: string) => t === "access_unlocked" },
  { id: "return", label: "Return", match: (t: string) => ["result_returned", "receipt_created"].includes(t) },
] as const;

function computeSteps(events: TollGateEvent[]) {
  const types = events.map((e) => e.type);
  const done = STEPS.map((step) => types.some((t) => step.match(t)));
  let activeIdx = 0;
  for (let i = 0; i < STEPS.length; i++) {
    if (!done[i]) {
      activeIdx = i;
      break;
    }
    activeIdx = i;
  }
  const allDone = done.every(Boolean);
  if (allDone) activeIdx = STEPS.length - 1;
  return { done, activeIdx, allDone };
}

type LivePaymentStepperProps = {
  events: TollGateEvent[];
  isLive?: boolean;
};

export function LivePaymentStepper({ events, isLive }: LivePaymentStepperProps) {
  const reduceMotion = useReducedMotion();
  const { done, activeIdx, allDone } = computeSteps(events);

  return (
    <section className="rounded-panel border border-hairline bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-base font-semibold tracking-tight text-ink">Live payment</h2>
      </div>
      <p className="mt-1 text-xs text-muted">
        Steps follow API <code className="font-mono text-[10px]">/events</code>. MCP / IDE flows may not appear until the
        API records them.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {STEPS.map((step, i) => {
          const isDone = done[i];
          const isCurrent = i === activeIdx && !isDone && !allDone;
          const lineDone = i > 0 && (done[i - 1] ?? false);

          return (
            <div key={step.id} className="flex items-center gap-3">
              <div className="flex w-8 flex-col items-center">
                {i > 0 ? <div className={`mb-1 h-3 w-px ${lineDone ? "bg-success/40" : "bg-hairline"}`} aria-hidden /> : null}
                <motion.div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                    isDone
                      ? "border-success/50 bg-success/15 text-success"
                      : isCurrent
                        ? "border-accent/60 bg-accent/15 text-accent shadow-[0_0_14px_rgba(217,119,6,0.22)]"
                        : "border-hairline bg-canvas text-muted"
                  }`}
                  animate={!reduceMotion && isCurrent ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 1.5, repeat: isCurrent ? Infinity : 0, ease: "easeInOut" }}
                >
                  {isDone ? <Check className="h-4 w-4" strokeWidth={2} aria-hidden /> : <Circle className="h-3.5 w-3.5" aria-hidden />}
                </motion.div>
                {i < STEPS.length - 1 ? (
                  <div className={`mt-1 h-3 w-px ${done[i] ? "bg-success/40" : "bg-hairline"}`} aria-hidden />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-medium ${
                    isDone ? "text-success" : isCurrent ? "text-accent" : "text-muted"
                  }`}
                >
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
