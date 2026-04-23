'use client';
import { Pause, Play, Trash2, Zap, Bot, Clock } from 'lucide-react';
import { AgentRule } from '@/lib/types';
import { CONDITION_LABELS, ACTION_LABELS, ACTION_SHORT } from '@/lib/constants';

interface Props {
  agent:       AgentRule;
  onPause:     (id: string) => void;
  onDelete:    (id: string) => void;
  onTrigger:   (agent: AgentRule) => void;
  processing:  boolean;
}

const STATUS_CONFIG = {
  idle:       { label: 'Idle',       color: 'text-muted',   dot: 'bg-muted/60',    ring: 'border-border' },
  monitoring: { label: 'Monitoring', color: 'text-secondary', dot: 'bg-secondary',  ring: 'border-secondary/30' },
  triggered:  { label: 'Triggered',  color: 'text-accent',  dot: 'bg-accent',      ring: 'border-accent/30' },
  paused:     { label: 'Paused',     color: 'text-warning',  dot: 'bg-warning',     ring: 'border-warning/30' },
  error:      { label: 'Error',      color: 'text-danger',  dot: 'bg-danger',      ring: 'border-danger/30' },
} as const;

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function AgentCard({ agent, onPause, onDelete, onTrigger, processing }: Props) {
  const cfg       = STATUS_CONFIG[agent.status];
  const isPaused  = agent.status === 'paused';
  const isActive  = agent.status === 'monitoring';
  const actionLabel = ACTION_SHORT[agent.action];

  return (
    <div className={`relative rounded-xl border bg-card overflow-hidden transition-all duration-300
                     animate-fade-in hover:border-primary/30 ${cfg.ring}`}>
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5
        ${agent.status === 'monitoring' ? 'bg-gradient-to-r from-secondary/0 via-secondary to-secondary/0' :
          agent.status === 'triggered'  ? 'bg-gradient-to-r from-accent/0   via-accent   to-accent/0'   :
          agent.status === 'paused'     ? 'bg-gradient-to-r from-warning/0  via-warning  to-warning/0'  :
          agent.status === 'error'      ? 'bg-gradient-to-r from-danger/0   via-danger   to-danger/0'   :
          'bg-border'}`}
      />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{agent.name}</p>
              <div className={`flex items-center gap-1.5 text-xs ${cfg.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}
                  ${isActive ? 'status-pulse' : ''}`}
                />
                {cfg.label}
              </div>
            </div>
          </div>

          {/* Action badge */}
          <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-bold font-mono
            ${agent.action === 'buy_sol'    ? 'bg-accent/15  text-accent'   :
              agent.action === 'sell_sol'   ? 'bg-danger/15  text-danger'   :
              'bg-secondary/15 text-secondary'}`}>
            {actionLabel}
          </span>
        </div>

        {/* Rule summary */}
        <div className="bg-card-2 rounded-lg p-3 mb-3 space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted w-10 flex-shrink-0">IF</span>
            <span className="text-text">{CONDITION_LABELS[agent.condition]}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted w-10 flex-shrink-0">THEN</span>
            <span className="text-text">{ACTION_LABELS[agent.action]}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted w-10 flex-shrink-0">AMT</span>
            <span className="font-mono text-text">{agent.amount} SOL</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted">
            <Clock className="w-3 h-3" />
            <span>{timeAgo(agent.createdAt)}</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Trigger now */}
            <button
              onClick={() => onTrigger(agent)}
              disabled={processing}
              title="Trigger now (demo)"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold
                         bg-accent/15 text-accent hover:bg-accent/25 disabled:opacity-40
                         transition-all active:scale-95"
            >
              <Zap className="w-3 h-3" />
              <span className="hidden sm:inline">Trigger</span>
            </button>

            {/* Pause / Resume */}
            <button
              onClick={() => onPause(agent.id)}
              title={isPaused ? 'Resume' : 'Pause'}
              className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-card-2 transition-all"
            >
              {isPaused
                ? <Play  className="w-3.5 h-3.5" />
                : <Pause className="w-3.5 h-3.5" />
              }
            </button>

            {/* Delete */}
            <button
              onClick={() => onDelete(agent.id)}
              title="Delete agent"
              className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
