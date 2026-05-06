# Build from the monorepo root (required for workspace dependencies):
#   docker build -f apps/paid-agent-api/Dockerfile .
FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/paid-agent-api ./apps/paid-agent-api

RUN pnpm install --frozen-lockfile \
  && pnpm --filter @tollgate/shared build \
  && pnpm --filter @tollgate/paid-agent-api build

WORKDIR /app/apps/paid-agent-api

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "dist/index.js"]
