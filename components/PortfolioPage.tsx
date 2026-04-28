'use client';
import { memo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { RefreshCw, TrendingUp, TrendingDown, PieChart, AlertCircle } from 'lucide-react';
import { TokenLogo } from './TokenLogo';
import { useWalletTokens } from '@/hooks/useWalletTokens';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { PriceData } from '@/lib/types';
import { SOL_MINT } from '@/lib/constants';

interface Props {
  price: PriceData | null;
}

function fmtUsd(n: number): string {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

function fmtBal(n: number): string {
  if (n < 0.0001) return n.toExponential(2);
  if (n < 1)      return n.toFixed(6);
  if (n < 1000)   return n.toFixed(3);
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

// Simple donut chart
function AllocationChart({
  items,
}: {
  items: { label: string; pct: number; color: string }[];
}) {
  const R  = 40;
  const cx = 50, cy = 50;
  const circumference = 2 * Math.PI * R;

  let offset = 0;
  const slices = items.map(item => {
    const dash = (item.pct / 100) * circumference;
    const gap  = circumference - dash;
    const slice = { ...item, dash, gap, offset };
    offset += dash;
    return slice;
  });

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90 flex-shrink-0">
        <circle cx={cx} cy={cy} r={R} fill="none"
                stroke="#1C2333" strokeWidth="12" />
        {slices.map((s, i) => (
          <circle key={i} cx={cx} cy={cy} r={R} fill="none"
                  stroke={s.color} strokeWidth="12"
                  strokeDasharray={`${s.dash} ${s.gap}`}
                  strokeDashoffset={-s.offset} />
        ))}
        <circle cx={cx} cy={cy} r={R - 8} fill="#161B22" />
      </svg>
      <div className="space-y-1.5 flex-1 min-w-0">
        {items.slice(0, 5).map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: item.color }} />
            <span className="text-xs text-muted truncate flex-1">
              {item.label}
            </span>
            <span className="text-xs font-mono text-text flex-shrink-0">
              {item.pct.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const COLORS = [
  '#6C5CE7', '#00C2FF', '#00FFA3', '#FFD93D',
  '#FF6B6B', '#A29BFE', '#FD79A8', '#74B9FF',
];

export const PortfolioPage = memo(function PortfolioPage({ price }: Props) {
  const { connected }             = useWallet();
  const { balance, refresh }      = useWalletBalance();
  const { tokens, loading, refresh: refreshTokens } = useWalletTokens();

  const solUsd    = (balance ?? 0) * (price?.current ?? 0);
  const tokensUsd = tokens.reduce(
    (sum, t) => sum + (t.balance ?? 0) * (t.price ?? 0), 0,
  );
  const totalUsd  = solUsd + tokensUsd;

  const allAssets = [
    {
      mint:    SOL_MINT,
      symbol:  'SOL',
      name:    'Solana',
      balance: balance ?? 0,
      price:   price?.current ?? 0,
      usd:     solUsd,
      change:  price?.change24h ?? 0,
    },
    ...tokens.map(t => ({
      mint:    t.mint,
      symbol:  t.symbol,
      name:    t.name,
      balance: t.balance,
      price:   t.price ?? 0,
      usd:     (t.balance ?? 0) * (t.price ?? 0),
      change:  0,
      logo:    t.logo,
    })),
  ].filter(a => a.usd > 0)
   .sort((a, b) => b.usd - a.usd);

  const chartItems = allAssets.slice(0, 7).map((a, i) => ({
    label: a.symbol,
    pct:   totalUsd > 0 ? (a.usd / totalUsd) * 100 : 0,
    color: COLORS[i] ?? '#30363D',
  }));

  if (!connected) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50
                      flex flex-col items-center justify-center py-16 text-center">
        <PieChart className="w-10 h-10 text-muted/40 mb-3" />
        <p className="text-sm font-semibold text-muted">Connect wallet to view portfolio</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold">Portfolio</h1>
        </div>
        <button
          onClick={() => { refresh(); refreshTokens(); }}
          className="p-2 rounded-lg hover:bg-card text-muted hover:text-text
                     transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Total value */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden
                      relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10
                        via-transparent to-secondary/5 pointer-events-none" />
        <div className="relative p-5">
          <p className="text-xs text-muted uppercase tracking-widest font-mono mb-2">
            Total Portfolio Value
          </p>
          <p className="text-4xl font-bold">{fmtUsd(totalUsd)}</p>
          <div className={`flex items-center gap-1.5 mt-2 text-sm
            ${(price?.change24h ?? 0) >= 0 ? 'text-accent' : 'text-danger'}`}>
            {(price?.change24h ?? 0) >= 0
              ? <TrendingUp   className="w-4 h-4" />
              : <TrendingDown className="w-4 h-4" />
            }
            SOL {(price?.change24h ?? 0) >= 0 ? '+' : ''}
            {price?.change24h?.toFixed(2) ?? '0.00'}% today
          </div>
        </div>
      </div>

      {/* Allocation chart */}
      {allAssets.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-bold text-muted uppercase tracking-wider mb-4">
            Allocation
          </p>
          <AllocationChart items={chartItems} />
        </div>
      )}

      {/* Holdings list */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <p className="font-bold text-sm">Holdings</p>
        </div>

        {loading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4">
                <div className="w-9 h-9 rounded-full bg-card-2 shimmer" />
                <div className="flex-1 space-y-1.5">
                  <div className="w-16 h-3 bg-card-2 rounded shimmer" />
                  <div className="w-24 h-2.5 bg-card-2 rounded shimmer" />
                </div>
                <div className="w-16 h-3 bg-card-2 rounded shimmer" />
              </div>
            ))}
          </div>
        ) : allAssets.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-muted">No holdings found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {allAssets.map((asset, i) => {
              const pos = asset.change >= 0;
              const pct = totalUsd > 0 ? (asset.usd / totalUsd) * 100 : 0;
              return (
                <div key={asset.mint}
                     className="flex items-center gap-3 px-5 py-4
                                hover:bg-card-2/50 transition-colors">
                  <div className="relative flex-shrink-0">
                    <TokenLogo
                      mint={asset.mint}
                      logo={'logo' in asset ? (asset as any).logo : undefined}
                      symbol={asset.symbol}
                      size="md"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4
                                     rounded-full bg-card border border-border
                                     flex items-center justify-center text-[8px]
                                     font-bold text-muted">
                      {i + 1}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-semibold text-sm">{asset.symbol}</p>
                      <p className="font-mono text-sm font-semibold">
                        {fmtUsd(asset.usd)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted font-mono">
                        {fmtBal(asset.balance)}
                      </p>
                      <p className="text-xs text-muted font-mono">
                        {pct.toFixed(1)}%
                      </p>
                    </div>
                    {/* Allocation bar */}
                    <div className="mt-1.5 h-1 bg-card-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width:      `${pct}%`,
                          background: COLORS[i] ?? '#30363D',
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-warning" />
          <p className="font-bold text-sm">HELM Suggestions</p>
        </div>
        <div className="space-y-2">
          {[
            {
              text:  'Set a stop-loss agent to protect your largest positions',
              icon:  '🛡️',
              color: 'bg-danger/5 border-danger/20',
            },
            {
              text:  'Enable DCA to automatically grow your SOL position weekly',
              icon:  '⏰',
              color: 'bg-primary/5 border-primary/20',
            },
          ].map((s, i) => (
            <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl border ${s.color}`}>
              <span className="text-base flex-shrink-0">{s.icon}</span>
              <p className="text-xs text-muted leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
