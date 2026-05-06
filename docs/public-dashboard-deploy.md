# Public Dashboard Deploy Guide (Vercel)

Deploy `apps/dashboard` as a public frontend that points to your hosted TollGate API.

## Required environment

Set these in Vercel project settings:

```env
NEXT_PUBLIC_TOLLGATE_API_URL=https://YOUR_PUBLIC_API_URL
NEXT_PUBLIC_PAYMENT_MODE=x402
TOLLGATE_PAID_API_URL=https://YOUR_PUBLIC_API_URL
TOLLGATE_MOCK_API_URL=http://localhost:4000
```

Notes:

- `NEXT_PUBLIC_TOLLGATE_API_URL` is safe to expose (public endpoint).
- Never set buyer private keys in dashboard env.

## Deploy steps

1. Import this repo into Vercel.
2. Set root directory to `apps/dashboard` or keep monorepo defaults with workspace detection.
3. Add the env vars above.
4. Deploy.

## Post-deploy checks

1. Open `https://YOUR_DASHBOARD_URL`.
2. Confirm "Public API URL" indicator matches your hosted API.
3. Confirm marketplace cards load from API (`GET /agents`).
4. Confirm health indicator reflects API status.
5. Run mock and x402 fallback buttons and verify receipt/timeline updates.
