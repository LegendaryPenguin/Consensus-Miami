"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AppNav } from "../components/AppNav";

const apiBaseUrl = process.env.NEXT_PUBLIC_TOLLGATE_API_URL ?? "http://localhost:4000";

const LandingScrollExperience = dynamic(() => import("../components/landing-scroll/LandingScrollExperience"), {
  ssr: false,
  loading: () => (
    <div className="mx-auto flex min-h-[320px] max-w-6xl items-center justify-center px-4 text-sm text-muted md:px-8">
      Loading interactive story…
    </div>
  ),
});

type Tx = { txHash: string; timestamp: string; amountUsdc: string };

export default function LandingPage() {
  const [apiHealth, setApiHealth] = useState<{ ok: boolean; paymentMode: string } | null>(null);
  const [txHistory, setTxHistory] = useState<Tx[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        const [healthRes, txRes] = await Promise.all([fetch(`${apiBaseUrl}/health`), fetch("/api/transaction-history")]);
        if (healthRes.ok) {
          setApiHealth((await healthRes.json()) as { ok: boolean; paymentMode: string });
        }
        if (txRes.ok) {
          const d = (await txRes.json()) as { transfers?: Tx[] };
          setTxHistory(d.transfers ?? []);
        }
      } catch {
        // no-op
      }
    };
    void run();
  }, []);

  const latest = txHistory[0];

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <AppNav
        current="home"
      />

      <section className="mx-auto max-w-6xl px-4 pb-10 pt-8 md:px-8 md:pt-14">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <p className="text-xs uppercase tracking-[0.24em] text-muted">HandOff</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">Paid tools for Cursor agents.</h1>
          <p className="mt-4 max-w-xl text-sm text-muted">Discover agents, pay with x402, and unlock results on demand.</p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/marketplace"
              className="rounded-lg border border-accent/50 bg-accent/15 px-4 py-2 text-sm font-medium text-accent"
            >
              Marketplace
            </Link>
            <Link href="/seller" className="rounded-lg border border-hairline bg-surface px-4 py-2 text-sm font-medium text-ink">
              Seller View
            </Link>
            <Link href="/connect-to-cursor" className="rounded-lg border border-hairline bg-surface px-4 py-2 text-sm font-medium text-ink">
              IDE setup
            </Link>
          </div>
        </motion.div>
      </section>

      <LandingScrollExperience latestTx={latest} />

      <section className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/seller"
            className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-accent px-6 py-3 text-base font-semibold text-white shadow-md shadow-accent/25 transition hover:bg-accent/90 md:text-lg"
          >
            Seller View
          </Link>
          <Link
            href="/marketplace"
            className="inline-flex min-h-[48px] items-center justify-center rounded-lg border-2 border-hairline bg-surface px-6 py-3 text-base font-semibold text-ink transition hover:border-ink/20 hover:bg-mutedSurface/50 md:text-lg"
          >
            Open Marketplace
          </Link>
        </div>
      </section>
    </main>
  );
}
