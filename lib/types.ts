// ─── Shared Types ────────────────────────────────────────────────────────────

export type Condition =
  | 'price_drop_5'
  | 'price_drop_10'
  | 'price_rise_5'
  | 'price_rise_10'
  | 'always';

export type Action =
  | 'buy_sol'
  | 'sell_sol'
  | 'send_alert';

export type AgentStatus =
  | 'idle'
  | 'monitoring'
  | 'triggered'
  | 'paused'
  | 'error';

export interface AgentRule {
  id:         string;
  name:       string;
  condition:  Condition;
  action:     Action;
  amount:     number;         // SOL amount
  status:     AgentStatus;
  createdAt:  Date;
  triggeredAt?: Date;
}

export interface Execution {
  id:          string;
  agentId:     string;
  agentName:   string;
  action:      Action;
  amount:      number;
  timestamp:   Date;
  txHash:      string | null;
  status:      'success' | 'failed' | 'pending';
  price:       number;         // SOL price at execution
}

export interface PriceData {
  current:    number;
  change24h:  number;         // percentage
  history:    number[];       // last N prices for sparkline
}
