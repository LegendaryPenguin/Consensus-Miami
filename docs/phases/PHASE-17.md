# Phase 17 - Prepare Dashboard for Public Hosting

## Goal

Make the dashboard deployable to a public URL and point it to the hosted API via env configuration.

Current local dashboard:
- `http://localhost:3000`

Target public dashboard:
- `https://YOUR_DASHBOARD_URL`

## Required Dashboard Behavior

1. Use `NEXT_PUBLIC_TOLLGATE_API_URL`.
2. Do not assume `localhost`.
3. Show API health from public API URL.
4. Load marketplace from `GET /agents`.
5. Keep timeline, receipt, and final-answer views functional.
6. Show visible “Public API URL” indicator.
7. Include a clear “Connect to Cursor” page/section.

## Required Dashboard Environment

```env
NEXT_PUBLIC_TOLLGATE_API_URL=https://YOUR_PUBLIC_API_URL
NEXT_PUBLIC_PAYMENT_MODE=x402
```

## Implementation Tasks

- Replace hardcoded local API URLs with env-based config.
- Add `.env.dashboard.example`.
- Add Vercel deployment guide for dashboard.
- Add API health display using public API.
- Ensure dashboard works both local and hosted.

## Checklist

- [ ] Dashboard starts locally
- [ ] Dashboard reads `NEXT_PUBLIC_TOLLGATE_API_URL`
- [ ] Marketplace loads from API env URL
- [ ] API health indicator works
- [ ] Real x402 demo still works when backend supports it
- [ ] Simulated/mock fallback still works
- [ ] No private key is exposed in browser code
- [ ] No buyer private key appears in dashboard code
