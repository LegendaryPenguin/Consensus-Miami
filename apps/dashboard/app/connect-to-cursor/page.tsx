"use client";

import { useMemo, useState } from "react";

const demoPrompt = `Use TollGate Bazaar.

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
                BUYER_EVM_PRIVATE_KEY: "0x_YOUR_TESTNET_ONLY_PRIVATE_KEY",
                BUYER_WALLET_ADDRESS: "0x_YOUR_BUYER_ADDRESS",
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

  return (
    <main className="min-h-screen bg-bg px-6 py-8 text-slate-100">
      <h1 className="text-3xl font-semibold">Connect to Cursor</h1>
      <p className="mt-2 text-sm text-slate-300">
        TollGate Bazaar uses a local MCP server in Cursor that points to a public TollGate API.
      </p>
      <p className="mt-1 text-sm text-slate-300">
        Buyer private keys stay local in Cursor config and are never entered in browser forms.
      </p>

      <section className="mt-6 rounded-xl border border-line/30 bg-panel p-4">
        <h2 className="text-lg font-semibold">Public API URL</h2>
        <p className="mt-2 text-sm">{publicApiUrl}</p>
        <button
          onClick={() => copy(publicApiUrl, "Public API URL")}
          className="mt-3 rounded-lg border border-line bg-line/10 px-3 py-2 text-sm hover:bg-line/20"
        >
          Copy Public API URL
        </button>
      </section>

      <section className="mt-4 rounded-xl border border-line/30 bg-panel p-4">
        <h2 className="text-lg font-semibold">Cursor MCP Config Template</h2>
        <pre className="mt-2 overflow-x-auto rounded-md border border-slate-700 bg-slate-950/50 p-3 text-xs">{mcpConfig}</pre>
        <button
          onClick={() => copy(mcpConfig, "MCP config")}
          className="mt-3 rounded-lg border border-line bg-line/10 px-3 py-2 text-sm hover:bg-line/20"
        >
          Copy MCP Config
        </button>
      </section>

      <section className="mt-4 rounded-xl border border-amber-500/30 bg-panel p-4">
        <h2 className="text-lg font-semibold text-amber-200">Safety warning</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-200">
          <li>Use a fresh testnet-only buyer wallet.</li>
          <li>Never use your main wallet.</li>
          <li>Never paste private keys into browser forms.</li>
          <li>Only place private keys in local Cursor MCP config or local `.env`.</li>
        </ul>
      </section>

      <section className="mt-4 rounded-xl border border-line/30 bg-panel p-4">
        <h2 className="text-lg font-semibold">Setup checklist</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-200">
          <li>Clone repo</li>
          <li>`pnpm install`</li>
          <li>`pnpm build`</li>
          <li>Add MCP config to Cursor</li>
          <li>Restart Cursor</li>
          <li>Run the demo prompt</li>
        </ul>
      </section>

      <section className="mt-4 rounded-xl border border-line/30 bg-panel p-4">
        <h2 className="text-lg font-semibold">Demo prompt</h2>
        <pre className="mt-2 whitespace-pre-wrap rounded-md border border-slate-700 bg-slate-950/50 p-3 text-xs">{demoPrompt}</pre>
        <button
          onClick={() => copy(demoPrompt, "Demo prompt")}
          className="mt-3 rounded-lg border border-line bg-line/10 px-3 py-2 text-sm hover:bg-line/20"
        >
          Copy Demo Prompt
        </button>
      </section>

      <p className="mt-6 text-xs text-slate-400">Future convenience command (planned): `npx tollgate-bazaar-mcp`</p>
      {copied ? <p className="mt-2 text-sm text-line">{copied}</p> : null}
    </main>
  );
}
