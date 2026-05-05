# Phase 1 - Monorepo Scaffold

## Goal

Create the TypeScript monorepo structure before integrating payments.

## Target Structure

```text
tollgate-bazaar/
  apps/
    dashboard/
    paid-agent-api/
    mcp-server/
  packages/
    shared/
  docs/
```

## Tasks

- Initialize pnpm workspace.
- Add `apps/dashboard` (Next.js + Tailwind + Framer Motion).
- Add `apps/paid-agent-api` (Express or Fastify TypeScript API).
- Add `apps/mcp-server` (TypeScript MCP server base).
- Add `packages/shared` (types + helpers starter).
- Add root scripts:
  - `pnpm dev`
  - `pnpm dev:dashboard`
  - `pnpm dev:api`
  - `pnpm dev:mcp`
  - `pnpm test`
  - `pnpm typecheck`

## Deliverables

- Workspace manifests (`package.json`, `pnpm-workspace.yaml`, tsconfig strategy)
- Bootable app stubs for all three apps
- Shared package consumed by all apps

## Checklist

- [ ] `pnpm install` works
- [ ] `pnpm typecheck` passes
- [ ] Dashboard starts on `localhost:3000`
- [ ] Paid agent API starts on `localhost:4000`
- [ ] MCP server starts without crashing
- [ ] Shared package imports work from all apps

## Exit Criteria

The full monorepo boots locally and all foundational apps run.
