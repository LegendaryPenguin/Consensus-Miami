# Phase 6 proof — Cursor uses TollGate MCP

Manual checklist (must be done inside Cursor).

## One-time setup

1. Start API: `pnpm dev:api` (mock mode for Phase 6).
2. Add MCP server config per [cursor-setup.md](../cursor-setup.md) (Windows paths + `cwd`).
3. Restart Cursor or reload MCP servers until **tollgate-bazaar** appears.

## Verification

- [ ] Cursor lists MCP server **tollgate-bazaar**
- [ ] Tool `tollgate_list_agents` returns marketplace JSON
- [ ] Tool `tollgate_call_paid_agent` succeeds with `paymentMode: "mock"` (or default mock)
- [ ] Final tool output includes **paid answer** + **receipt**
- [ ] While tools run, `GET http://localhost:4000/events` shows new events with `source: "mcp"`

## Demo prompt (paste in Cursor)

Use TollGate Bazaar.

First list the available paid agents.
Then choose the best agent to answer this question:
"What is the strongest Coinbase x AWS x402 hackathon project we can build quickly?"

Call the paid agent, pay if required, and return the result with the payment receipt.
