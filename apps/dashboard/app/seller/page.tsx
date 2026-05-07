"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AppNav } from "../../components/AppNav";

type SellerAgent = {
  id: string;
  ownerId: string;
  name: string;
  priceUsd: string;
  endpoint: string;
  sellerWalletAddress: string;
  status: "active" | "disabled";
  createdAt: string;
  updatedAt: string;
};

type TxRow = {
  id: string;
  agentId: string;
  agentName: string;
  buyerAddress: string;
  sellerAddress: string;
  amountUsd: string;
  network: string;
  paymentMode: string;
  status: string;
  txHash?: string;
  createdAt: string;
  endpoint: string;
};

const EXPLORER = "https://sepolia.basescan.org/tx/";
const ENV_SELLER_WALLET = process.env.NEXT_PUBLIC_SELLER_WALLET_ADDRESS?.trim() ?? "";
const isAddress = (v: string) => /^0x[a-fA-F0-9]{40}$/.test(v);

export default function SellerPage() {
  const [agents, setAgents] = useState<SellerAgent[]>([]);
  const [txSummary, setTxSummary] = useState<{ totalCalls: number; totalRevenueUsd: string; transactions: TxRow[] } | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState({ id: "", name: "", priceUsd: "0.001", sellerWalletAddress: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ name: "", priceUsd: "", status: "active" as "active" | "disabled" });
  const [sellerBalanceChip, setSellerBalanceChip] = useState<string | null>(null);
  const [sellerBalanceAddress, setSellerBalanceAddress] = useState<string | null>(null);

  const refreshSellerBalance = useCallback(async () => {
    try {
      const res = await fetch("/api/wallet-balances", { cache: "no-store" });
      const data = (await res.json()) as { seller?: { address?: string | null; balanceFormatted?: string | null } };
      const formatted = data.seller?.balanceFormatted;
      const n = formatted ? Number.parseFloat(formatted) : Number.NaN;
      setSellerBalanceChip(Number.isFinite(n) ? `${n.toFixed(4)} USDC` : null);
      setSellerBalanceAddress(data.seller?.address ?? null);
    } catch {
      setSellerBalanceChip(null);
      setSellerBalanceAddress(null);
    }
  }, []);

  const loadAgents = useCallback(async () => {
    setLoadError(null);
    const res = await fetch("/api/seller/agents", { cache: "no-store" });
    const data = (await res.json()) as { agents?: SellerAgent[]; error?: string };
    if (!res.ok) {
      setLoadError(data.error ?? `HTTP ${res.status}`);
      return;
    }
    setAgents(data.agents ?? []);
  }, []);

  const loadTx = useCallback(async () => {
    const res = await fetch("/api/seller/transactions", { cache: "no-store" });
    const data = (await res.json()) as { totalCalls?: number; totalRevenueUsd?: string; transactions?: TxRow[] };
    if (res.ok) {
      setTxSummary({
        totalCalls: data.totalCalls ?? 0,
        totalRevenueUsd: data.totalRevenueUsd ?? "0",
        transactions: data.transactions ?? [],
      });
    }
  }, []);

  useEffect(() => {
    void refreshSellerBalance();
    void loadAgents();
    void loadTx();
    void refreshSellerBalance();
    const t = setInterval(() => void refreshSellerBalance(), 15000);
    return () => clearInterval(t);
  }, [loadAgents, loadTx, refreshSellerBalance]);

  const addAgent = async () => {
    setLoadError(null);
    const res = await fetch("/api/seller/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: form.id.trim() || undefined,
        name: form.name.trim(),
        priceUsd: form.priceUsd.trim(),
        sellerWalletAddress: form.sellerWalletAddress.trim(),
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setLoadError(data.error ?? `HTTP ${res.status}`);
      return;
    }
    setForm({ id: "", name: "", priceUsd: "0.001", sellerWalletAddress: "" });
    await loadAgents();
    void loadTx();
  };

  const saveEdit = async (id: string) => {
    const res = await fetch(`/api/seller/agents/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editDraft.name,
        priceUsd: editDraft.priceUsd,
        status: editDraft.status,
      }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setLoadError(data.error ?? "Save failed");
      return;
    }
    setEditingId(null);
    await loadAgents();
  };

  const removeAgent = async (id: string) => {
    if (!confirm(`Delete ${id}?`)) return;
    const res = await fetch(`/api/seller/agents/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) {
      setLoadError("Delete failed");
      return;
    }
    await loadAgents();
  };

  const sellerWalletResolved =
    sellerBalanceAddress || (isAddress(ENV_SELLER_WALLET) ? ENV_SELLER_WALLET : null) || agents[0]?.sellerWalletAddress || null;
  const sellerWalletShort = sellerWalletResolved
    ? `${sellerWalletResolved.slice(0, 6)}…${sellerWalletResolved.slice(-4)}`
    : "not set";

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <AppNav current="seller" />
      <div className="mx-auto max-w-4xl px-4 py-4 text-sm text-muted md:px-8">
        Seller wallet <span className="font-mono text-ink">{sellerWalletShort}</span> · Balance{" "}
        <span className="font-medium text-ink">{sellerBalanceChip ?? "loading..."}</span>
        {sellerBalanceAddress ? <span className="ml-1 text-xs">(from {sellerBalanceAddress.slice(0, 6)}…{sellerBalanceAddress.slice(-4)})</span> : null}
      </div>
      <div className="mx-auto max-w-4xl space-y-8 px-4 pb-8 md:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Seller console</h1>
            <p className="mt-1 text-sm text-muted">Agents · revenue · ledger</p>
          </div>
          <div className="flex gap-2">
            <Link href="/marketplace" className="rounded border border-hairline bg-raised px-3 py-2 text-sm">
              Marketplace
            </Link>
          </div>
        </header>

        {loadError ? (
          <p className="rounded-panel border border-warning/40 bg-raised px-3 py-2 text-sm text-warning">{loadError}</p>
        ) : null}

        <section className="rounded-panel border border-hairline bg-surface p-5 shadow-card">
          <h2 className="text-lg font-semibold">Add agent</h2>
          <p className="mt-1 text-xs text-muted">Slug id (optional). Seller wallet receives x402 on Base Sepolia.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              className="rounded border border-hairline bg-canvas px-3 py-2 text-sm"
              placeholder="id (e.g. my-agent)"
              value={form.id}
              onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
            />
            <input
              className="rounded border border-hairline bg-canvas px-3 py-2 text-sm"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <input
              className="rounded border border-hairline bg-canvas px-3 py-2 text-sm"
              placeholder="Price USD"
              value={form.priceUsd}
              onChange={(e) => setForm((f) => ({ ...f, priceUsd: e.target.value }))}
            />
            <input
              className="rounded border border-hairline bg-canvas px-3 py-2 font-mono text-xs"
              placeholder="0x seller wallet"
              value={form.sellerWalletAddress}
              onChange={(e) => setForm((f) => ({ ...f, sellerWalletAddress: e.target.value }))}
            />
          </div>
          <button
            type="button"
            onClick={() => void addAgent()}
            className="mt-4 rounded border border-accent/50 bg-accent/15 px-4 py-2 text-sm font-medium text-accent"
          >
            Create
          </button>
        </section>

        <section className="rounded-panel border border-hairline bg-surface p-5 shadow-card">
          <h2 className="text-lg font-semibold">Active agents</h2>
          <ul className="mt-4 space-y-3">
            {agents.map((a) => (
              <li key={a.id} className="rounded border border-hairline bg-canvas p-3">
                {editingId === a.id ? (
                  <div className="grid gap-2 sm:grid-cols-3">
                    <input
                      className="rounded border border-hairline px-2 py-1 text-sm"
                      value={editDraft.name}
                      onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                    />
                    <input
                      className="rounded border border-hairline px-2 py-1 text-sm"
                      value={editDraft.priceUsd}
                      onChange={(e) => setEditDraft((d) => ({ ...d, priceUsd: e.target.value }))}
                    />
                    <select
                      className="rounded border border-hairline px-2 py-1 text-sm"
                      value={editDraft.status}
                      onChange={(e) => setEditDraft((d) => ({ ...d, status: e.target.value as "active" | "disabled" }))}
                    >
                      <option value="active">active</option>
                      <option value="disabled">disabled</option>
                    </select>
                    <div className="flex gap-2 sm:col-span-3">
                      <button type="button" className="text-sm text-accent" onClick={() => void saveEdit(a.id)}>
                        Save
                      </button>
                      <button type="button" className="text-sm text-muted" onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{a.name}</p>
                      <p className="font-mono text-xs text-muted">{a.id}</p>
                      <p className="text-xs text-muted">${a.priceUsd} · {a.status}</p>
                      <p className="mt-1 break-all font-mono text-[10px] text-muted">{a.endpoint}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="text-xs text-accent"
                        onClick={() => {
                          setEditingId(a.id);
                          setEditDraft({ name: a.name, priceUsd: a.priceUsd, status: a.status });
                        }}
                      >
                        Edit
                      </button>
                      <button type="button" className="text-xs text-danger" onClick={() => void removeAgent(a.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
            {agents.length === 0 ? <li className="text-sm text-muted">No seller agents yet.</li> : null}
          </ul>
        </section>

        <section className="rounded-panel border border-hairline bg-surface p-5 shadow-card">
          <h2 className="text-lg font-semibold">On-chain transfers / profits</h2>
          {txSummary ? (
            <>
              <p className="mt-2 text-sm text-muted">
                Calls: <span className="text-ink">{txSummary.totalCalls}</span> · Revenue USD:{" "}
                <span className="text-ink">{txSummary.totalRevenueUsd}</span>
              </p>
              <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto text-sm">
                {txSummary.transactions.map((t) => (
                  <li key={t.id} className="rounded border border-hairline bg-canvas px-3 py-2">
                    <p className="font-medium">{t.agentName}</p>
                    <p className="text-xs text-muted">
                      ${t.amountUsd} · {t.paymentMode} · {new Date(t.createdAt).toLocaleString()}
                    </p>
                    {t.txHash ? (
                      <a className="text-xs text-accent hover:underline" href={`${EXPLORER}${t.txHash}`} target="_blank" rel="noreferrer">
                        {t.txHash.slice(0, 10)}…
                      </a>
                    ) : (
                      <span className="text-xs text-muted">No tx hash</span>
                    )}
                  </li>
                ))}
                {txSummary.transactions.length === 0 ? <li className="text-muted">No ledger rows yet.</li> : null}
              </ul>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted">Loading…</p>
          )}
        </section>
      </div>
    </main>
  );
}
