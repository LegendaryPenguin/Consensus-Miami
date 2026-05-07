"use client";

type StatusStripProps = {
  apiHealth: { ok: boolean; paymentMode: string } | null;
  eventConnection: "connected" | "disconnected";
  lastTxTimestamp: string | null;
};

export function StatusStrip({ apiHealth, eventConnection, lastTxTimestamp }: StatusStripProps) {
  const apiLabel =
    apiHealth?.ok === true
      ? `API reachable · ${apiHealth.paymentMode}`
      : apiHealth === null
        ? "Checking API…"
        : "API unreachable";

  const eventsLabel =
    eventConnection === "connected" ? "Event log reachable" : "Event log unreachable (optional)";

  const lastLabel = lastTxTimestamp
    ? `Last on-chain transfer: ${new Date(lastTxTimestamp).toLocaleString()}`
    : "No transfers in history window yet";

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-hairline bg-surface px-4 py-3 text-sm text-muted sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-1">
      <p className="text-ink">
        <span className="text-muted">Status · </span>
        {apiLabel}
      </p>
      <p className="text-ink">
        <span className="text-muted">Events · </span>
        {eventsLabel}
      </p>
      <p className="min-w-0 text-ink">
        <span className="text-muted">Ledger · </span>
        <span className="truncate">{lastLabel}</span>
      </p>
    </div>
  );
}
