"use client";

import type { PaymentReceipt } from "@tollgate/shared";

const EXPLORER = "https://sepolia.basescan.org/tx/";

function shortTx(h?: string) {
  if (!h || h.length < 14) return "—";
  return `${h.slice(0, 8)}…${h.slice(-6)}`;
}

function shortAddr(a?: string) {
  if (!a || a.length < 12) return "—";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

type ReceiptPanelProps = {
  receipt: PaymentReceipt | null;
  resultPreview?: string;
};

export function ReceiptPanel({ receipt, resultPreview }: ReceiptPanelProps) {
  const tx = receipt?.settlementTxHash;

  return (
    <section className="rounded-panel border border-hairline bg-surface p-5 shadow-card">
      <h2 className="text-base font-semibold tracking-tight text-ink">Receipt</h2>
      {!receipt ? (
        <p className="mt-3 text-sm text-muted">No receipt yet. Run a test from Tools or pay via MCP.</p>
      ) : (
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <dt className="text-[11px] text-muted">Amount</dt>
            <dd className="font-medium text-ink">${receipt.priceUsd} USDC</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted">Status</dt>
            <dd className="font-medium capitalize text-ink">{receipt.status}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-[11px] text-muted">Settlement tx</dt>
            <dd className="font-mono text-xs text-ink">
              {tx ? (
                <a href={`${EXPLORER}${tx}`} className="text-accent hover:underline" target="_blank" rel="noreferrer">
                  {shortTx(tx)}
                </a>
              ) : (
                shortTx(undefined)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted">Buyer</dt>
            <dd className="font-mono text-xs text-ink">{shortAddr(receipt.buyerAddress)}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted">Seller</dt>
            <dd className="font-mono text-xs text-ink">{shortAddr(receipt.sellerAddress)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-[11px] text-muted">Time</dt>
            <dd className="text-xs text-ink">{new Date(receipt.createdAt).toLocaleString()}</dd>
          </div>
        </dl>
      )}
      {resultPreview ? (
        <p className="mt-4 line-clamp-3 border-t border-hairline pt-3 text-xs leading-relaxed text-muted">{resultPreview}</p>
      ) : null}
    </section>
  );
}
