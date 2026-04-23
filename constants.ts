import { Condition, Action } from './types';

// ─── Network ─────────────────────────────────────────────────────────────────
export const SOLANA_RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT ||
  'https://api.devnet.solana.com';

export const EXPLORER_BASE = 'https://explorer.solana.com/tx';
export const EXPLORER_CLUSTER = '?cluster=devnet';

// ─── Mock price seed ─────────────────────────────────────────────────────────
export const MOCK_SOL_PRICE_USD = 148.5;

// ─── Label maps ──────────────────────────────────────────────────────────────
export const CONDITION_LABELS: Record<Condition, string> = {
  price_drop_5:  'SOL drops 5%',
  price_drop_10: 'SOL drops 10%',
  price_rise_5:  'SOL rises 5%',
  price_rise_10: 'SOL rises 10%',
  always:        'Always (demo)',
};

export const ACTION_LABELS: Record<Action, string> = {
  buy_sol:    '🟢 Buy SOL',
  sell_sol:   '🔴 Sell SOL',
  send_alert: '🔔 Send Alert',
};

export const ACTION_SHORT: Record<Action, string> = {
  buy_sol:    'Buy',
  sell_sol:   'Sell',
  send_alert: 'Alert',
};
