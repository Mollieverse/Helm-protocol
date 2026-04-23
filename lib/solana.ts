import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { SOLANA_RPC_ENDPOINT, EXPLORER_BASE, EXPLORER_CLUSTER } from './constants';

// ─── Connection singleton ─────────────────────────────────────────────────────
let _connection: Connection | null = null;

export function getConnection(): Connection {
  if (!_connection) {
    _connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');
  }
  return _connection;
}

// ─── Fetch SOL balance ────────────────────────────────────────────────────────
export async function getSolBalance(pubkey: PublicKey): Promise<number> {
  const conn = getConnection();
  const lamports = await conn.getBalance(pubkey);
  return lamports / LAMPORTS_PER_SOL;
}

// ─── Build a self-transfer transaction (demo trade) ───────────────────────────
/**
 * Builds a minimal SOL transfer to self so the user can sign a real
 * on-chain transaction during the demo. Amount is tiny (0.000001 SOL).
 */
export function buildDemoTransaction(
  fromPubkey: PublicKey,
): Transaction {
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey: fromPubkey,   // send to self — safe demo transaction
      lamports: 1_000,        // 0.000001 SOL — essentially dust
    }),
  );
  return tx;
}

// ─── Explorer link ───────────────────────────────────────────────────────────
export function explorerLink(txHash: string): string {
  return `${EXPLORER_BASE}/${txHash}${EXPLORER_CLUSTER}`;
}

// ─── Address shortener ───────────────────────────────────────────────────────
export function shortAddress(addr: string, chars = 4): string {
  return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
}

// ─── Nano ID generator (no dep needed) ───────────────────────────────────────
export function nanoId(): string {
  return Math.random().toString(36).slice(2, 10);
}
