import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { listAgents } from "@tollgate/shared";

export type SellerAgentStatus = "active" | "disabled";

export type SellerAgentRecord = {
  id: string;
  ownerId: string;
  name: string;
  priceUsd: string;
  endpoint: string;
  sellerWalletAddress: string;
  status: SellerAgentStatus;
  createdAt: string;
  updatedAt: string;
};

type StoreFile = {
  agents: SellerAgentRecord[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const AGENTS_FILE = path.join(DATA_DIR, "agents.json");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readStore(): StoreFile {
  try {
    if (!fs.existsSync(AGENTS_FILE)) return { agents: [] };
    const raw = fs.readFileSync(AGENTS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as StoreFile;
    if (!Array.isArray(parsed.agents)) return { agents: [] };
    return parsed;
  } catch {
    return { agents: [] };
  }
}

function writeStore(store: StoreFile) {
  ensureDir();
  const tmp = `${AGENTS_FILE}.${randomUUID()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2), "utf-8");
  fs.renameSync(tmp, AGENTS_FILE);
}

const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function listSellerAgents(): SellerAgentRecord[] {
  return readStore().agents;
}

export function getSellerAgentById(id: string): SellerAgentRecord | undefined {
  return readStore().agents.find((a) => a.id === id);
}

export type CreateSellerAgentInput = {
  id?: string;
  ownerId?: string;
  name: string;
  priceUsd: string;
  sellerWalletAddress: string;
};

function reservedStaticIds(): Set<string> {
  return new Set([...listAgents().map((a) => a.id), "wallet-risk-agent"]);
}

export function createSellerAgent(input: CreateSellerAgentInput, apiOrigin: string): SellerAgentRecord {
  const raw = (input.id ?? "").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const slug = raw && idPattern.test(raw) ? raw : `agent-${randomUUID().slice(0, 8)}`;
  if (!idPattern.test(slug)) {
    throw new Error("invalid_agent_id");
  }
  if (reservedStaticIds().has(slug)) {
    throw new Error("reserved_id");
  }
  const store = readStore();
  if (store.agents.some((a) => a.id === slug)) {
    throw new Error("agent_id_exists");
  }
  const now = new Date().toISOString();
  const endpoint = new URL(`/agents/${slug}`, apiOrigin).toString();
  const agent: SellerAgentRecord = {
    id: slug,
    ownerId: (input.ownerId ?? "demo").trim() || "demo",
    name: input.name.trim(),
    priceUsd: input.priceUsd.trim(),
    endpoint,
    sellerWalletAddress: input.sellerWalletAddress.trim(),
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
  store.agents.push(agent);
  writeStore(store);
  return agent;
}

export type PatchSellerAgentInput = {
  name?: string;
  priceUsd?: string;
  endpoint?: string;
  sellerWalletAddress?: string;
  status?: SellerAgentStatus;
};

export function patchSellerAgent(id: string, patch: PatchSellerAgentInput): SellerAgentRecord | undefined {
  const store = readStore();
  const idx = store.agents.findIndex((a) => a.id === id);
  if (idx === -1) return undefined;
  const cur = store.agents[idx];
  const updated: SellerAgentRecord = {
    ...cur,
    name: patch.name !== undefined ? patch.name.trim() : cur.name,
    priceUsd: patch.priceUsd !== undefined ? patch.priceUsd.trim() : cur.priceUsd,
    endpoint: patch.endpoint !== undefined ? patch.endpoint.trim() : cur.endpoint,
    sellerWalletAddress:
      patch.sellerWalletAddress !== undefined ? patch.sellerWalletAddress.trim() : cur.sellerWalletAddress,
    status: patch.status ?? cur.status,
    updatedAt: new Date().toISOString(),
  };
  store.agents[idx] = updated;
  writeStore(store);
  return updated;
}

export function deleteSellerAgent(id: string): boolean {
  const store = readStore();
  const next = store.agents.filter((a) => a.id !== id);
  if (next.length === store.agents.length) return false;
  writeStore({ agents: next });
  return true;
}
