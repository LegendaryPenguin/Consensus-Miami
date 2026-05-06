# Connect to Cursor

TollGate Bazaar is accessed from Cursor through a local MCP server.

Flow:

1. Cursor uses local TollGate MCP server.
2. Local MCP server points to public TollGate API.
3. Buyer private key stays local.
4. Public API verifies x402 payment and returns paid result.

## Quick setup

1. Clone repo.
2. `pnpm install`
3. `pnpm build`
4. Add MCP config in Cursor (template on dashboard `/connect-to-cursor` page).
5. Restart Cursor and run the demo prompt.

## Safety rules

- Use a fresh testnet-only wallet.
- Never use a mainnet wallet.
- Do not paste private keys into browser forms.
- Keep buyer key only in local MCP config or local `.env`.
