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
