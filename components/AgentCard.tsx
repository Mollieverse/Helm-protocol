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

  const actionColor = agent.action === 'buy'
    ? 'bg-accent/15 text-accent'
    : agent.action === 'sell'
    ? 'bg-danger/15 text-danger'
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
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
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
              {agent.status === 'paused'
                ? <Play  className="w-3.5 h-3.5" />
                : <Pause className="w-3.5 h-3.5" />}
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
