"use client";

import { useMemo, useState } from "react";
import { AppNav } from "../../components/AppNav";

const samplePrompt = `Use TollGate Bazaar.

List the available paid agents.
Choose the Hackathon Research Agent.
Ask it:
"What is the strongest Coinbase x AWS x402 hackathon project we should build?"

Pay if required using x402 and return:
1. the paid agent answer
2. the payment receipt
3. why x402 was necessary.`;

export default function ConnectToCursorPage() {
  const publicApiUrl = process.env.NEXT_PUBLIC_TOLLGATE_API_URL ?? "https://YOUR_PUBLIC_API_URL";
  const [copied, setCopied] = useState<string>("");
  const mcpConfig = useMemo(
    () =>
      JSON.stringify(
        {
          mcpServers: {
            "tollgate-bazaar": {
              command: "node",
              args: ["C:/FULL/PATH/TO/tollgate-bazaar/apps/mcp-server/dist/index.js"],
              env: {
                TOLLGATE_PAYMENT_MODE: "x402",
                TOLLGATE_API_URL: publicApiUrl,
                BUYER_WALLET_PRIVATE_KEY: "0x_YOUR_TESTNET_ONLY_PRIVATE_KEY",
                X402_NETWORK: "eip155:84532",
                X402_FACILITATOR_URL: "https://x402.org/facilitator",
                X402_VERSION: "2",
              },
            },
          },
        },
        null,
        2,
      ),
    [publicApiUrl],
  );

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(`${label} copied`);
    } catch {
      setCopied(`Failed to copy ${label}`);
    } finally {
      setTimeout(() => setCopied(""), 1200);
    }
  };

  const btn =
    "rounded-lg border border-hairline bg-raised px-3 py-2 text-sm text-ink transition-colors hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <AppNav current="connect" networkLabel="Base Sepolia" />
      <div className="px-6 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">IDE setup (Cursor &amp; Kiro)</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        TollGate Bazaar is driven by the same local MCP server in any IDE that supports Model Context Protocol over stdio
        (Cursor, Kiro, and others). The MCP process calls your public TollGate API; payments and signing use env vars on
        your machine, not the browser.
      </p>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Buyer keys stay in local MCP config or a local <code className="rounded bg-surface px-1 py-0.5 font-mono text-xs">.env</code>{" "}
        loaded by the server — never paste private keys into dashboard forms.
      </p>

      <section className="mt-6 rounded-panel border border-hairline bg-surface p-4 shadow-card">
        <h2 className="text-lg font-semibold">Public API URL</h2>
        <p className="mt-2 font-mono text-sm text-muted">{publicApiUrl}</p>
        <button type="button" onClick={() => void copy(publicApiUrl, "Public API URL")} className={`mt-3 ${btn}`}>
          Copy public API URL
        </button>
      </section>

      <section className="mt-4 rounded-panel border border-hairline bg-surface p-4 shadow-card">
        <h2 className="text-lg font-semibold">MCP config template</h2>
        <p className="mt-2 text-sm text-muted">
          Point <code className="font-mono text-xs">args</code> at your built{" "}
          <code className="font-mono text-xs">apps/mcp-server/dist/index.js</code>. Match{" "}
          <code className="font-mono text-xs">TOLLGATE_API_URL</code> to the URL your agents reach (local or deployed).
        </p>
        <pre className="mt-3 overflow-x-auto rounded-md border border-hairline bg-canvas p-3 font-mono text-xs text-muted">
          {mcpConfig}
        </pre>
        <button type="button" onClick={() => void copy(mcpConfig, "MCP config")} className={`mt-3 ${btn}`}>
          Copy MCP config
        </button>
      </section>

      <section className="mt-4 rounded-panel border border-warning/35 bg-surface p-4 shadow-card">
        <h2 className="text-lg font-semibold text-warning">Safety</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
          <li>Use a dedicated Base Sepolia test wallet.</li>
          <li>Never use mainnet funds or production keys.</li>
          <li>Keep <code className="font-mono text-xs">BUYER_WALLET_PRIVATE_KEY</code> out of git and chat logs.</li>
        </ul>
      </section>

      <section className="mt-4 rounded-panel border border-hairline bg-surface p-4 shadow-card">
        <h2 className="text-lg font-semibold">Setup checklist</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
          <li>Clone the repo and run <code className="font-mono text-xs">pnpm install</code></li>
          <li>
            Build MCP: <code className="font-mono text-xs">pnpm --filter @tollgate/mcp-server build</code> (or repo-wide{" "}
            <code className="font-mono text-xs">pnpm build</code>)
          </li>
          <li>Add the MCP server block to your IDE&apos;s MCP settings</li>
          <li>Restart the IDE so the new server is picked up</li>
          <li>Run the sample prompt against your configured API</li>
        </ul>
      </section>

      <section className="mt-4 rounded-panel border border-hairline bg-surface p-4 shadow-card">
        <h2 className="text-lg font-semibold">Sample prompt</h2>
        <pre className="mt-3 whitespace-pre-wrap rounded-md border border-hairline bg-canvas p-3 font-mono text-xs text-muted">
          {samplePrompt}
        </pre>
        <button type="button" onClick={() => void copy(samplePrompt, "Sample prompt")} className={`mt-3 ${btn}`}>
          Copy sample prompt
        </button>
      </section>

      <p className="mt-6 text-xs text-muted">Planned convenience: <code className="font-mono">npx tollgate-bazaar-mcp</code></p>
      {copied ? <p className="mt-2 text-sm text-accent">{copied}</p> : null}
      </div>
    </main>
  );
}
