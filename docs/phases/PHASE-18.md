# Phase 18 - Add Connect to Cursor Page

## Goal

Make onboarding easy so another user can connect Cursor to TollGate Bazaar using a local MCP server and public API.

## Required Messaging

- TollGate is accessed from Cursor through a **local MCP server**.
- Local MCP points to the **public TollGate API**.
- Buyer private key remains **local**.

## Required Page Content

1. Public API URL display:
   - `https://YOUR_PUBLIC_API_URL`
2. Cursor MCP config template for local MCP:
   - include `TOLLGATE_API_URL`, `TOLLGATE_PAYMENT_MODE`, testnet network/facilitator
   - include buyer key env in local config only
3. Safety warning:
   - testnet-only fresh wallet
   - never use main wallet
   - never paste private keys into browser forms
4. Setup checklist:
   - clone repo
   - `pnpm install`
   - `pnpm build`
   - add MCP config
   - restart Cursor
   - run demo prompt
5. Demo prompt block.
6. Copy buttons:
   - Copy MCP Config
   - Copy Demo Prompt
   - Copy Public API URL
7. Optional note for future MCP CLI package support.

## Implementation Tasks

- Add Connect to Cursor route/page.
- Add copy-to-clipboard actions.
- Generate config from `NEXT_PUBLIC_TOLLGATE_API_URL`.
- Add `docs/connect-to-cursor.md`.
- Link page from README.

## Checklist

- [ ] Connect to Cursor page exists
- [ ] MCP config renders with public API URL
- [ ] Copy MCP Config button works
- [ ] Copy Demo Prompt button works
- [ ] Page clearly warns about private keys
- [ ] Page explains local MCP vs public API clearly
- [ ] A new user can follow setup without extra guidance
