# Phase 8 - Real x402 Buyer Integration

## Goal

Enable MCP server to execute real x402 testnet buyer flow.

## Source of Truth

- Installed CDP skill docs
- `docs/cdp-llms-full.txt`

## Requirements

- MCP server uses testnet buyer wallet
- Initial request made without payment
- Parse 402 payment requirements
- Create/sign x402 payment
- Retry with attached payment
- Return unlocked result + receipt
- Preserve mock mode fallback

## Environment Variables

- `BUYER_WALLET_PRIVATE_KEY` or CDP wallet config
- `X402_NETWORK`
- `X402_FACILITATOR_URL`
- `TOLLGATE_PAYMENT_MODE=mock|x402`

## Security Requirements

- Never commit private keys
- Add `.env.example`
- Add `.gitignore` entries for `.env`
- Testnet wallet only

## Checklist

- [ ] `TOLLGATE_PAYMENT_MODE=mock` still works
- [ ] `TOLLGATE_PAYMENT_MODE=x402` executes 402 -> pay -> retry
- [ ] Cursor receives result after real x402 payment
- [ ] Dashboard marks `x402 verified`
- [ ] Receipt includes network/price/buyer/seller/endpoint/timestamp
- [ ] No secrets committed

## Exit Criteria

Real buyer flow works end-to-end through MCP server in testnet mode.
