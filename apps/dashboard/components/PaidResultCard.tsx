"use client";

import type { PaymentReceipt } from "@tollgate/shared";

type PaidResultCardProps = {
  answer: string;
  receipt: PaymentReceipt | null;
  buyerShort: string;
  sellerShort: string;
  isComplete: boolean;
};

export function PaidResultCard({ answer, receipt, buyerShort, sellerShort, isComplete }: PaidResultCardProps) {
  const receiptLine =
    receipt && isComplete
      ? `${receipt.priceUsd} USDC · Base Sepolia · ${receipt.paymentMode} verified`
      : null;

  return (
    <section className="rounded-2xl border border-border bg-panel/80 p-6 shadow-card">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Paid Result</h2>
      {!isComplete ? (
        <div className="mt-4">
          <p className="text-slate-200">Waiting for paid result…</p>
          <p className="mt-2 text-sm text-slate-500">
            Run a demo from the top bar or use the developer drawer to reset and try mock or x402 flows.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">{answer}</p>
          {receiptLine ? (
            <p className="text-xs font-medium text-slate-400">{receiptLine}</p>
          ) : null}
          {receipt?.settlementTxHash ? (
            <p className="text-xs text-slate-500">
              Tx: <span className="font-mono text-slate-300">{shortTx(receipt.settlementTxHash)}</span>
            </p>
          ) : null}
          <p className="text-xs text-slate-500">
            <span className="text-slate-400">{buyerShort}</span>
            <span className="mx-2 text-slate-600">→</span>
            <span className="text-slate-400">{sellerShort}</span>
          </p>
        </div>
      )}
    </section>
  );
}

function shortTx(txHash: string): string {
  if (txHash.length < 14) return txHash;
  return `${txHash.slice(0, 10)}...${txHash.slice(-8)}`;
}
