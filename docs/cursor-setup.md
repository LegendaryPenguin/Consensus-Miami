# Cursor MCP setup (Windows-friendly)

## Prerequisites

- Node.js 20+ recommended
- Repo root: run `pnpm install` once
- For Phase 6 demos, run **`pnpm dev:api`** so `http://localhost:4000` is live

## Cursor `mcp.json` snippet

Replace `C:\\\\Users\\\\YOU\\\\Desktop\\\\Consensus-Miami` with your **absolute** repo path (double backslashes in JSON).

```json
{
  "mcpServers": {
    "tollgate-bazaar": {
      "command": "pnpm",
      "args": [
        "--filter",
        "@tollgate/mcp-server",
        "exec",
        "tsx",
        "src/index.ts"
      ],
      "cwd": "C:\\\\Users\\\\YOU\\\\Desktop\\\\Consensus-Miami",
      "env": {
        "TOLLGATE_API_URL": "http://localhost:4000",
        "TOLLGATE_PAYMENT_MODE": "mock",
        "X402_NETWORK": "eip155:84532",
        "X402_FACILITATOR_URL": "https://x402.org/facilitator",
        "SELLER_WALLET_ADDRESS": "0xYourBaseSepoliaSellerAddress"
      }
    }
  }
}
```

### Alternative: run compiled MCP (after `pnpm build`)

```json
{
  "mcpServers": {
    "tollgate-bazaar": {
      "command": "node",
      "args": [
        "C:\\\\Users\\\\YOU\\\\Desktop\\\\Consensus-Miami\\\\apps\\\\mcp-server\\\\dist\\\\index.js"
      ],
      "cwd": "C:\\\\Users\\\\YOU\\\\Desktop\\\\Consensus-Miami",
      "env": {
        "TOLLGATE_API_URL": "http://localhost:4000",
        "TOLLGATE_PAYMENT_MODE": "mock"
      }
    }
  }
}
```

## Phase 6 manual checklist

See [proofs/phase6-cursor-checklist.md](proofs/phase6-cursor-checklist.md).

## Env naming (important)

| Variable | Consumer | Purpose |
|----------|----------|---------|
| `PAYMENT_MODE` | **paid-agent-api** (preferred) | `mock` vs `x402` seller paywall |
| `TOLLGATE_PAYMENT_MODE` | **paid-agent-api** (fallback) then **mcp-server** | API: only if `PAYMENT_MODE` unset. MCP: default tool payment mode. |

For Phase 7 seller tests, set **`PAYMENT_MODE=x402`** in the environment of `pnpm dev:api`, not only `TOLLGATE_PAYMENT_MODE`.

## Phase 5 proof (MCP Inspector)

See [proofs/phase5-mcp-inspector.md](proofs/phase5-mcp-inspector.md).
