# Phase 7 - Real x402 Seller Integration

## Goal

Replace mock seller guard with real x402 paywall middleware on testnet.

## Source of Truth

- Installed CDP skill docs
- `docs/cdp-llms-full.txt`

## Requirements

- Testnet only
- Use x402-recommended network from docs (e.g., Base Sepolia if current)
- Use x402-recommended test asset
- Use test seller wallet
- Use testnet facilitator from docs
- Preserve mock mode fallback

## Environment Variables

- `X402_NETWORK`
- `X402_FACILITATOR_URL`
- `SELLER_WALLET_ADDRESS`
- `PRICE_USD`
- `PAYMENT_MODE=mock|x402`

## Behavior

- `PAYMENT_MODE=mock`: existing mock flow unchanged
- `PAYMENT_MODE=x402`: enforce real x402 payment requirements

## Checklist

- [ ] Mock mode still works
- [ ] x402 mode returns real 402 payment requirements
- [ ] 402 response includes valid x402 metadata
- [ ] Seller wallet loaded from env
- [ ] No mainnet keys used
- [ ] Testnet-only config enforced

## Exit Criteria

Seller endpoint supports real x402 gating while preserving fallback mode.
