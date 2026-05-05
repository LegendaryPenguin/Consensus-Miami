# Phase 5 proof — MCP server → API → 402 → mock retry → result

## Preconditions

1. Terminal A: start API in **mock** seller mode (default):

   ```bash
   pnpm dev:api
   ```

   Confirm `GET http://localhost:4000/health` shows `"paymentMode":"mock"`.

2. Install MCP Inspector (once):

   ```bash
   pnpm dlx @modelcontextprotocol/inspector
   ```

   Follow the Inspector UI to attach a **stdio** server.

## Start the TollGate MCP server (stdio)

From repo root, run the MCP package in dev mode (stdio transport):

```bash
pnpm dev:mcp
```

In MCP Inspector, set:

- **Command**: `pnpm`
- **Args**: `--filter`, `@tollgate/mcp-server`, `exec`, `tsx`, `src/index.ts`
- **Cwd**: absolute path to repo root (e.g. `C:\Users\...\Consensus-Miami`)

Environment (minimum):

- `TOLLGATE_API_URL=http://localhost:4000`
- `TOLLGATE_PAYMENT_MODE=mock`

## Required tool checks

### 1) `tollgate_list_agents`

- Expect JSON with `agents` array from `@tollgate/shared` registry.

### 2) `tollgate_call_paid_agent`

Arguments:

- `agentId`: `hackathon-research-agent`
- `question`: any string length ≥ 3
- `paymentMode`: `mock` (or omit if `TOLLGATE_PAYMENT_MODE=mock`)

Expect:

- Tool succeeds
- Response JSON includes `answer`, `receipt`, `events`
- `events` includes `payment_required` then successful unlock path

### 3) `tollgate_get_latest_receipt`

- Expect `receipt` object matching the last successful call.

## Event log cross-check (dashboard / API)

After calling tools, open:

```bash
curl.exe -s http://localhost:4000/events
```

You should see MCP-posted events (source `mcp`) appended to the in-memory timeline.

## Note on `paymentMode: "x402"` from MCP

With `paymentMode: "x402"`, the MCP server **does not** fake-pay via `X-Mock-Payment` (Phase 8 buyer). The tool returns a structured error after observing `402`, until real buyer signing exists.
