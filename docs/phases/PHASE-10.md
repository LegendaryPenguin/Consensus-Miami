# Phase 10 - MCPay Reference Reuse

## Goal

Reuse useful patterns from MCPay without cloning architecture or product identity.

## Reference

- `https://github.com/microchipgnu/MCPay/tree/cdp-hackathon-submission`

## Focus Areas

- MCP server initialization patterns
- x402 buyer/client flow
- x402 seller/proxy/middleware flow
- registry format
- event/revenue logging patterns
- dashboard ideas
- retry-after-402 implementation

## Rules

- Reuse only small, understood snippets.
- Verify license compatibility.
- Do not copy full architecture.
- Keep TollGate Bazaar marketplace/gateway identity distinct.

## Required Doc

- `docs/mcpay-reference-notes.md` with:
  - what was reused
  - what was changed
  - why TollGate Bazaar is different

## Checklist

- [ ] `docs/mcpay-reference-notes.md` exists
- [ ] Any adapted code is minimal and understood
- [ ] README clearly differentiates product from MCPay
- [ ] Project runs independently

## Exit Criteria

Reference value is captured while preserving original product direction.
