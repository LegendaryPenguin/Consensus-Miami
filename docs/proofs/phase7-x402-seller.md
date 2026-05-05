# Phase 7 proof — real x402 seller (testnet)

## Preconditions

1. Set a **real Base Sepolia** seller EOA in `SELLER_WALLET_ADDRESS` (not a placeholder string).
2. Set **`PAYMENT_MODE=x402`** for `apps/paid-agent-api` (this takes precedence over `TOLLGATE_PAYMENT_MODE` for the API).
3. Restart the API.

Startup will **exit with an error** if `SELLER_WALLET_ADDRESS` is missing or still a documented placeholder (see `apps/paid-agent-api/src/index.ts`).

## Health check

```bash
curl.exe -s http://localhost:4000/health
```

Expect `paymentMode":"x402"` and your `facilitator` URL.

Captured sample (separate proof run on port 4027): see [captured/phase7-health.txt](captured/phase7-health.txt).

## Positive test — unpaid request (real x402 402)

Use a JSON file body to avoid Windows shell escaping issues:

```bash
curl.exe -i -X POST "http://localhost:4000/agents/hackathon-research" ^
  -H "Content-Type: application/json" ^
  --data-binary "@docs/proof-payload.json"
```

Expect:

- `HTTP/1.1 402 Payment Required`
- Header **`PAYMENT-REQUIRED`** (base64 JSON describing scheme, network `eip155:84532`, amount, asset, `payTo`)

Captured output: [captured/phase7-unpaid.txt](captured/phase7-unpaid.txt).

## Negative test — mock header must NOT unlock in x402 mode

```bash
curl.exe -i -X POST "http://localhost:4000/agents/hackathon-research" ^
  -H "Content-Type: application/json" ^
  -H "X-Mock-Payment: paid" ^
  --data-binary "@docs/proof-payload.json"
```

Expect: still **`402 Payment Required`** with `PAYMENT-REQUIRED` (same as unpaid). Mock unlock applies only when `PAYMENT_MODE=mock`.

Captured output: [captured/phase7-mock-header.txt](captured/phase7-mock-header.txt).
