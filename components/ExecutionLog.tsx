'use client';
import { memo, useMemo } from 'react';
import { ExternalLink, CheckCircle2, XCircle, Loader2, Zap } from 'lucide-react';
import { Execution } from '@/lib/types';
import { explorerLink } from '@/lib/solana';

const ExecRow = memo(function ExecRow({ exec }: { exec: Execution }) {
  const timeStr = useMemo(
    () => exec.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    [exec.timestamp],
  );
  const shortHash = (h: string) => `${h.slice(0, 8)}...${h.slice(-6)}`;
  const actionLabel = `${exec.action.charAt(0).toUpperCase() + exec.action.slice(1)} ${exec.tokenSymbol}`;

  return (
    <div className="px-5 py-4 hover:bg-card-2/50 transition-colors border-b border-border last:border-0">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {exec.status === 'success' ? <CheckCircle2 className="w-4 h-4 text-accent" />
           : exec.status === 'failed' ? <XCircle className="w-4 h-4 text-danger" />
           : <Loader2 className="w-4 h-4 text-secondary animate-spin" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-semibold truncate">{exec.agentName}</p>
            <span className={`flex-shrink-0 text-xs font-mono font-bold px-2 py-0.5 rounded-full
              ${exec.status === 'success' ? 'bg-accent/10 text-accent'
                : exec.status === 'failed' ? 'bg-danger/10 text-danger'
                : 'bg-secondary/10 text-secondary'}`}>
              {exec.status.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-muted mb-2">
            {actionLabel} · <span className="font-mono text-text">{exec.amount} SOL</span>
            {' '}@ <span className="font-mono">${exec.price.toFixed(2)}</span>
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted/70">{timeStr}</span>
            {exec.txHash && exec.txHash !== 'alert-only' ? (
              <a href={explorerLink(exec.txHash)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-secondary hover:text-secondary/80 font-mono transition-colors">
                {shortHash(exec.txHash)}<ExternalLink className="w-3 h-3" />
              </a>
            ) : exec.txHash === 'alert-only' ? (
              <span className="text-xs text-muted/60 font-mono">alert sent</span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
});

export const ExecutionLog = memo(function ExecutionLog({ executions }: { executions: Execution[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent" />
          <h2 className="font-bold text-sm">Execution Log</h2>
        </div>
        <span className="text-xs font-mono text-muted bg-card-2 px-2 py-0.5 rounded-full">{executions.length}</span>
      </div>
      {executions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
          <div className="w-12 h-12 rounded-full bg-card-2 flex items-center justify-center mb-3">
            <Zap className="w-6 h-6 text-muted/50" />
          </div>
          <p className="text-sm font-medium text-muted">No executions yet</p>
          <p className="text-xs text-muted/60 mt-1">Create an agent and trigger it</p>
        </div>
      ) : (
        <div className="max-h-[420px] overflow-y-auto">
          {executions.map(exec => <ExecRow key={exec.id} exec={exec} />)}
        </div>
      )}
    </div>
  );
});
