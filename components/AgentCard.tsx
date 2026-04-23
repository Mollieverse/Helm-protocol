'use client';
import { memo, useMemo } from 'react';
import { Pause, Play, Trash2, Zap, Clock, TrendingDown, TrendingUp } from 'lucide-react';
import { AgentRule } from '@/lib/types';

interface Props {
  agent:      AgentRule;
  onPause:    (id: string) => void;
  onDelete:   (id: string) => void;
  onTrigger:  (agent: AgentRule) => void;
  processing: boolean;
}

const STATUS_CONFIG = {
  idle:       { label: 'Idle',       color: 'text-muted',     dot: 'bg-muted/60',  ring: 'border-border'       },
  monitoring: { label: 'Monitoring', color: 'text-secondary', dot: 'bg-secondary', ring: 'border-secondary/30' },
  triggered:  { label: 'Triggered',  color: 'text-accent',    dot: 'bg-accent',    ring: 'border-accent/30'    },
  paused:     { label: 'Paused',     color: 'text-warning',   dot: 'bg-warning',   ring: 'border-warning/30'   },
  error:      { label: 'Error',      color: 'text-danger',    dot: 'bg-danger',    ring: 'border-danger/30'    },
} as const;

function timeAgo(date: Date): string {
  const m = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export const AgentCard = memo(function AgentCard({
  agent, onPause, onDelete, onTrigger, processing,
}: Props) {
  const cfg = STATUS_CONFIG[agent.status];

  const accentLine = useMemo(() => {
    switch (agent.status) {
      case 'monitoring': return 'bg-gradient-to-r from-secondary/0 via-secondary to-secondary/0';
      case 'triggered':  return 'bg-gradient-to-r from-accent/0   via-accent   to-accent/0';
      case 'paused':     return 'bg-gradient-to-r from-warning/0  via-warning  to-warning/0';
      case 'error':      return 'bg-gradient-to-r from-danger/0   via-danger   to-danger/0';
      default:           return 'bg-border';
    }
  }, [agent.status]);

  const actionColor = agent.action === 'buy' ? 'bg-accent/15 text-accent'
    : agent.action === 'sell'  ? 'bg-danger/15 text-danger'
    : 'bg-secondary/15 text-secondary';

  const condIcon = agent.conditionType === 'price_drops'
    ? <TrendingDown className="w-3 h-3" />
    : <TrendingUp   className="w-3 h-3" />;

  const condText = `${agent.conditionType === 'price_drops' ? 'drops' : 'rises'} ${agent.conditionPct}%`;

  return (
    <div className={`relative rounded-xl border bg-card overflow-hidden transition-colors duration-200
                     hover:border-primary/30 ${cfg.ring}`}>
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${accentLine}`} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Token avatar */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30
                            flex items-center justify-center text-xs font-bold font-mono flex-shrink-0">
              {agent.token.symbol.slice(0, 3)}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{agent.name}</p>
              <div className={`flex items-center gap-1.5 text-xs ${cfg.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}
                  ${agent.status === 'monitoring' ? 'status-pulse' : ''}`} />
                {cfg.label}
              </div>
            </div>
          </div>
          <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-bold font-mono ${actionColor}`}>
            {agent.action.toUpperCase()}
          </span>
        </div>

        {/* Rule summary */}
        <div className="bg-card-2 rounded-lg p-3 mb-3 space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted w-10 flex-shrink-0">TOKEN</span>
            <span className="font-mono font-bold text-text">
              {agent.token.symbol}
              <span className="text-muted font-normal ml-1">{agent.token.name}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted w-10 flex-shrink-0">IF</span>
            <span className="flex items-center gap-1 text-text">
              {condIcon} {agent.token.symbol} {condText} in 24h
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted w-10 flex-shrink-0">THEN</span>
            <span className="capitalize text-text">{agent.action} {agent.amount} SOL</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted">
            <Clock className="w-3 h-3" />
            <span>{timeAgo(agent.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onTrigger(agent)}
              disabled={processing}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold
                         bg-accent/15 text-accent hover:bg-accent/25 disabled:opacity-40
                         transition-colors active:scale-95"
            >
              <Zap className="w-3 h-3" />
              <span className="hidden sm:inline">Trigger</span>
            </button>
            <button
              onClick={() => onPause(agent.id)}
              className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-card-2 transition-colors"
            >
              {agent.status === 'paused' ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => onDelete(agent.id)}
              className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}, (prev, next) =>
  prev.agent.status        === next.agent.status        &&
  prev.agent.name          === next.agent.name          &&
  prev.agent.conditionType === next.agent.conditionType &&
  prev.agent.conditionPct  === next.agent.conditionPct  &&
  prev.agent.token.id      === next.agent.token.id      &&
  prev.agent.action        === next.agent.action        &&
  prev.agent.amount        === next.agent.amount        &&
  prev.processing          === next.processing
);
components/BalanceCard.tsx
'use client';
import { memo, useMemo } from 'react';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PriceData } from '@/lib/types';
import { shortAddress } from '@/lib/solana';

const Sparkline = memo(function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const path = useMemo(() => {
    if (!data.length) return null;
    const W = 120, H = 40;
    const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
    const pts = data.map((v, i) => ({
      x: (i / (data.length - 1)) * W,
      y: H - ((v - min) / range) * H,
    }));
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const color = positive ? '#00FFA3' : '#FF6B6B';
    return { d, color, W, H };
  }, [data, positive]);

  if (!path) return null;
  const { d, color, W, H } = path;

  return (
    <svg width={W} height={H} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0"   />
        </linearGradient>
      </defs>
      <path d={`${d} L${W} ${H} L0 ${H} Z`} fill="url(#sg)" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
});

interface Props {
  balance: number | null;
  loading: boolean;
  refresh: () => void;
  price:   PriceData;
}

export const BalanceCard = memo(function BalanceCard({ balance, loading, refresh, price }: Props) {
  const { connected, publicKey } = useWallet();
  const positive = price.change24h >= 0;
  const usdValue = balance != null ? (balance * price.current).toFixed(2) : null;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border glow-purple">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-card to-secondary/5 pointer-events-none" />
      <div className="relative p-5 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-muted uppercase tracking-widest font-mono mb-1">Portfolio Balance</p>
            {connected && publicKey && (
              <p className="font-mono text-xs text-primary/80">{shortAddress(publicKey.toBase58(), 6)}</p>
            )}
          </div>
          <button onClick={refresh} className={`p-1.5 rounded-lg hover:bg-card-2 text-muted hover:text-text transition-all ${loading ? 'animate-spin' : ''}`}>
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {!connected ? (
          <div><p className="text-4xl font-bold text-muted">—</p><p className="text-sm text-muted mt-1">Connect wallet to view balance</p></div>
        ) : loading ? (
          <div className="space-y-2">
            <div className="h-10 w-48 rounded-lg bg-card-2 shimmer" />
            <div className="h-5 w-32 rounded-lg bg-card-2 shimmer" />
          </div>
        ) : (
          <div>
            <div className="flex items-end gap-3 mb-1">
              <span className="text-4xl sm:text-5xl font-bold tracking-tight text-glow-green">{balance?.toFixed(4) ?? '0.0000'}</span>
              <span className="text-lg text-muted mb-1">SOL</span>
            </div>
            <p className="text-xl text-muted font-mono">≈ <span className="text-text">${usdValue ?? '0.00'}</span> <span className="text-sm">USD</span></p>
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs text-muted mb-0.5">SOL / USD</p>
              <p className="font-mono text-lg font-bold">${price.current.toFixed(2)}</p>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-mono font-bold
              ${positive ? 'bg-accent/10 text-accent' : 'bg-danger/10 text-danger'}`}>
              {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {positive ? '+' : ''}{price.change24h.toFixed(2)}%
            </div>
          </div>
          <Sparkline data={price.history} positive={positive} />
        </div>
      </div>
    </div>
  );
});
