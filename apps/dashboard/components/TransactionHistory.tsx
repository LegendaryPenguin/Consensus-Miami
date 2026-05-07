"use client";

const EXPLORER_TX = "https://sepolia.basescan.org/tx/";

type Tx = {
  txHash: string;
  timestamp: string;
  amountUsdc: string;
};

type TransactionHistoryProps = {
  items: Tx[];
  loading: boolean;
  error: string | null;
  lastRefreshedAt: number | null;
};

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const sec = Math.floor((Date.now() - t) / 1000);
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  return `${h}h ago`;
}

export function TransactionHistory({ items, loading, error, lastRefreshedAt }: TransactionHistoryProps) {
  const hint =
    error?.includes("missing_addresses") || error?.toLowerCase().includes("env")
      ? "Set NEXT_PUBLIC_BUYER_WALLET_ADDRESS and NEXT_PUBLIC_SELLER_WALLET_ADDRESS in apps/dashboard/.env.local (or Vercel env), then restart the dev server."
      : null;

  return (
    <section className="rounded-panel border border-hairline bg-surface p-5 shadow-card">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 className="text-base font-semibold tracking-tight text-ink">On-chain transfers</h2>
        <p className="text-xs text-muted">
          Updated {formatRelative(lastRefreshedAt ? new Date(lastRefreshedAt).toISOString() : null)}
        </p>
      </div>
      <p className="mt-1 text-xs text-muted">Live transfer feed for your configured Base Sepolia buyer and seller addresses.</p>

      {loading ? <p className="mt-4 text-sm text-muted">Loading transfers…</p> : null}

      {error ? (
        <div className="mt-4 rounded-panel border border-warning/40 bg-raised p-3 text-sm text-ink" role="alert">
          <p className="font-medium text-warning">Could not load history</p>
          <p className="mt-1 text-muted">{error}</p>
          {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
        </div>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No matching USDC transfers yet. Run a paid call from your IDE (MCP) and refresh.</p>
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-hairline text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
                <th className="py-2 pr-4">Time</th>
                <th className="py-2 pr-4 text-right">Amount</th>
                <th className="py-2">Transaction</th>
              </tr>
            </thead>
            <tbody>
              {items.map((tx) => (
                <tr key={tx.txHash} className="border-b border-hairline/80 last:border-0 hover:bg-raised/60">
                  <td className="py-2.5 pr-4 align-top text-ink tabular-nums">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 pr-4 align-top text-right text-ink tabular-nums">{tx.amountUsdc} USDC</td>
                  <td className="py-2.5 align-top">
                    <a
                      href={`${EXPLORER_TX}${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-link underline-offset-2 hover:text-linkHover hover:underline"
                    >
                      {tx.txHash.slice(0, 10)}…{tx.txHash.slice(-8)}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
