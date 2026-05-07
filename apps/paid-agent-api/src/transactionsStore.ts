import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type TransactionRecord = {
  id: string;
  agentId: string;
  agentName: string;
  buyerAddress: string;
  sellerAddress: string;
  amountUsd: string;
  amountUsdc?: string;
  network: string;
  paymentMode: "mock" | "x402";
  status: string;
  txHash?: string;
  createdAt: string;
  endpoint: string;
};

type StoreFile = {
  transactions: TransactionRecord[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const TX_FILE = path.join(DATA_DIR, "transactions.json");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readStore(): StoreFile {
  try {
    if (!fs.existsSync(TX_FILE)) return { transactions: [] };
    const raw = fs.readFileSync(TX_FILE, "utf-8");
    const parsed = JSON.parse(raw) as StoreFile;
    if (!Array.isArray(parsed.transactions)) return { transactions: [] };
    return parsed;
  } catch {
    return { transactions: [] };
  }
}

function writeStore(store: StoreFile) {
  ensureDir();
  const tmp = `${TX_FILE}.${randomUUID()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2), "utf-8");
  fs.renameSync(tmp, TX_FILE);
}

export function appendTransaction(row: Omit<TransactionRecord, "id" | "createdAt"> & { id?: string }): TransactionRecord {
  const store = readStore();
  const rec: TransactionRecord = {
    ...row,
    id: row.id ?? `tx-${randomUUID()}`,
    createdAt: new Date().toISOString(),
  };
  store.transactions.unshift(rec);
  writeStore(store);
  return rec;
}

export function listTransactions(filter?: { agentId?: string }): TransactionRecord[] {
  let list = readStore().transactions;
  if (filter?.agentId) list = list.filter((t) => t.agentId === filter.agentId);
  return list;
}

export function transactionSummary(filter?: { agentId?: string }) {
  const list = listTransactions(filter);
  const totalCalls = list.length;
  let totalUsd = 0;
  for (const t of list) {
    const n = Number.parseFloat(t.amountUsd);
    if (!Number.isNaN(n)) totalUsd += n;
  }
  return { totalCalls, totalRevenueUsd: totalUsd.toFixed(6), transactions: list };
}
