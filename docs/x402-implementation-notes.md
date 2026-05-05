# x402 Implementation Notes

Source basis: x402 seller quickstart and facilitator docs.

## Buyer flow

1. Call paid endpoint without payment.
2. Receive HTTP 402 with x402 payment requirements.
3. Build/sign payment against facilitator and target network.
4. Retry same request with payment headers.
5. Receive unlocked response + receipt metadata.

## Seller flow

1. Protect route with x402 middleware.
2. On unpaid request return HTTP 402 + payment requirements.
3. Verify payment on retried request.
4. Unlock resource and return paid response.
5. Optionally settle and log receipt/events.

## Testnet network

- `eip155:84532` (Base Sepolia)

## Facilitator

- `https://x402.org/facilitator`

## Required env vars

- `PAYMENT_MODE=mock|x402`
- `X402_NETWORK=eip155:84532`
- `X402_FACILITATOR_URL=https://x402.org/facilitator`
- `SELLER_WALLET_ADDRESS=<testnet wallet>`
- `PRICE_USD=0.003`

## Packages

- `@x402/express`
- `@x402/core`
- `@x402/evm`
