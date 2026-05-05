# Cursor MCP Setup

Add this to your Cursor MCP config:

```json
{
  "mcpServers": {
    "tollgate-bazaar": {
      "command": "pnpm",
      "args": ["--filter", "@tollgate/mcp-server", "start"],
      "env": {
        "TOLLGATE_API_URL": "http://localhost:4000",
        "TOLLGATE_PAYMENT_MODE": "mock",
        "X402_NETWORK": "eip155:84532",
        "X402_FACILITATOR_URL": "https://x402.org/facilitator",
        "SELLER_WALLET_ADDRESS": "0xYourTestSellerWallet"
      }
    }
  }
}
```

Start services:

1. `pnpm dev:api`
2. `pnpm dev:mcp`
3. `pnpm dev:dashboard`

Then in Cursor run:

- `tollgate_list_agents`
- `tollgate_call_paid_agent`
- `tollgate_get_latest_receipt`
