"use client";

type Tx = {
  txHash: string;
  timestamp: string;
  amountUsdc: string;
};

type TransactionHistoryProps = {
  items: Tx[];
  loading: boolean;
  error: string | null;
};

export function TransactionHistory({ items, loading, error }: TransactionHistoryProps) {
  return (
    <section className="rounded-2xl border border-border bg-panel/80 p-6 shadow-card">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Transaction History</h2>
      {loading ? <p className="mt-3 text-sm text-slate-400">Loading on-chain transfers...</p> : null}
      {error ? <p className="mt-3 text-sm text-warning">{error}</p> : null}
      {!loading && !error && items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No buyer → seller USDC transfers found yet.</p>
      ) : null}
      <div className="mt-4 space-y-2">
        {items.map((tx) => (
          <div key={tx.txHash} className="rounded-lg border border-border/60 bg-panel/50 p-3">
            <p className="text-xs text-slate-300">{new Date(tx.timestamp).toLocaleString()}</p>
            <p className="mt-1 text-xs text-slate-400">
              Amount: <span className="text-slate-200">{tx.amountUsdc} USDC</span>
            </p>
            <p className="mt-1 truncate font-mono text-[11px] text-slate-500">{tx.txHash}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
