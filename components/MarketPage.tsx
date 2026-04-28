'use client';
import { useState, useEffect, memo } from 'react';
import {
  TrendingUp, TrendingDown, Search,
  RefreshCw, Flame, Activity,
} from 'lucide-react';
import { TokenLogo } from './TokenLogo';

interface MarketToken {
  id:                          string;
  symbol:                      string;
  name:                        string;
  image:                       string;
  current_price:               number;
  price_change_percentage_24h: number;
  market_cap:                  number;
  total_volume:                number;
  sparkline_in_7d?:            { price: number[] };
}

const CATEGORIES = [
  { id: 'all',        label: 'All'         },
  { id: 'trending',   label: '🔥 Trending' },
  { id: 'gainers',    label: '📈 Gainers'  },
  { id: 'losers',     label: '📉 Losers'   },
  { id: 'meme',       label: '🐸 Meme'     },
  { id: 'defi',       label: '⚡ DeFi'     },
  { id: 'stables',    label: '🔒 Stable'   },
];

// Solana token mints for logo lookup
const MINT_MAP: Record<string, string> = {
  'solana':                  'So11111111111111111111111111111111111111112',
  'jito-governance-token':   'jtojtomepa8beP8AuQc6eXt5FriJwfFMwjx2ZEMxHMU',
  'raydium':                 '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
  'bonk':                    'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  'dogwifcoin':              'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
  'jupiter-exchange-solana': 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
  'pyth-network':            'HZ1JovNiVvGrG1jnrqCMQmxuExbzB3FKha4FszS5T6Hh',
  'render-token':            'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof',
  'orca-so':                 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
  'helium':                  'hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux',
  'popcat':                  '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
  'marinade':                'MNDEFzGvMt87ueuHvVU9VcTqsAP5b3fTGPsHuuPA5ey',
  'drift-protocol':          'DriFtupJYLTosbwoN8koMbEYSx54aFAVLddWsbksjwg7',
};

const SOLANA_IDS = Object.keys(MINT_MAP).join(',');

function fmtPrice(p: number): string {
  if (!p) return '$0.00';
  if (p < 0.000001) return `$${p.toFixed(10)}`;
  if (p < 0.001)    return `$${p.toFixed(6)}`;
  if (p < 1)        return `$${p.toFixed(4)}`;
  return `$${p.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function fmtMcap(n: number): string {
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(0)}M`;
  if (n >= 1e3)  return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

// Mini sparkline
function Spark({ prices, positive }: { prices: number[]; positive: boolean }) {
  if (!prices?.length) return null;
  const W = 60, H = 24;
  const min = Math.min(...prices), max = Math.max(...prices);
  const range = max - min || 1;
  const pts = prices.map((v, i) => ({
    x: (i / (prices.length - 1)) * W,
    y: H - ((v - min) / range) * H,
  }));
  const d   = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const col = positive ? '#00FFA3' : '#FF6B6B';
  return (
    <svg width={W} height={H}>
      <path d={d} fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const TokenRow = memo(function TokenRow({
  token, rank,
}: {
  token: MarketToken;
  rank:  number;
}) {
  const pos     = token.price_change_percentage_24h >= 0;
  const mint    = MINT_MAP[token.id];
  const sparks  = token.sparkline_in_7d?.price?.slice(-24) ?? [];

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-card-2/50
                    transition-colors border-b border-border/50 last:border-0">
      {/* Rank */}
      <span className="text-xs text-muted w-5 text-center flex-shrink-0">
        {rank}
      </span>

      {/* Logo + name */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <TokenLogo
          mint={mint}
          logo={token.image}
          symbol={token.symbol}
          size="md"
        />
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{token.name}</p>
          <p className="text-xs text-muted">{token.symbol.toUpperCase()}</p>
        </div>
      </div>

      {/* Sparkline */}
      <div className="hidden sm:block flex-shrink-0">
        <Spark prices={sparks} positive={pos} />
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        <p className="font-mono text-sm font-semibold">
          {fmtPrice(token.current_price)}
        </p>
        <div className={`flex items-center justify-end gap-0.5 text-xs font-mono
          ${pos ? 'text-accent' : 'text-danger'}`}>
          {pos
            ? <TrendingUp   className="w-3 h-3" />
            : <TrendingDown className="w-3 h-3" />
          }
          {pos ? '+' : ''}{token.price_change_percentage_24h?.toFixed(2)}%
        </div>
      </div>

      {/* Mcap */}
      <div className="hidden lg:block text-right flex-shrink-0 w-20">
        <p className="text-xs text-muted">{fmtMcap(token.market_cap)}</p>
      </div>
    </div>
  );
});

export function MarketPage({ solHistory }: { solHistory: number[] }) {
  const [tokens,   setTokens]   = useState<MarketToken[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('all');
  const [sort,     setSort]     = useState<'mcap' | 'change' | 'volume'>('mcap');
  const [sortDir,  setSortDir]  = useState<'asc' | 'desc'>('desc');
  const [updated,  setUpdated]  = useState<Date | null>(null);

  const fetchMarket = async () => {
    setLoading(true);
    try {
      const res  = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd` +
        `&ids=${SOLANA_IDS}&order=market_cap_desc&sparkline=true` +
        `&price_change_percentage=24h&per_page=50`,
      );
      const data = await res.json() as MarketToken[];
      setTokens(data);
      setUpdated(new Date());
    } catch { /* keep last */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchMarket();
    const id = setInterval(fetchMarket, 60_000);
    return () => clearInterval(id);
  }, []);

  const filtered = tokens
    .filter(t => {
      const q = search.toLowerCase();
      if (q && !t.name.toLowerCase().includes(q) &&
          !t.symbol.toLowerCase().includes(q)) return false;
      if (category === 'gainers') return t.price_change_percentage_24h > 0;
      if (category === 'losers')  return t.price_change_percentage_24h < 0;
      return true;
    })
    .sort((a, b) => {
      const mul = sortDir === 'desc' ? -1 : 1;
      if (sort === 'mcap')   return mul * (a.market_cap - b.market_cap);
      if (sort === 'change') return mul * (
        a.price_change_percentage_24h - b.price_change_percentage_24h
      );
      if (sort === 'volume') return mul * (a.total_volume - b.total_volume);
      return 0;
    });

  const toggleSort = (s: typeof sort) => {
    if (sort === s) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSort(s); setSortDir('desc'); }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-secondary" />
          <h1 className="text-xl font-bold">Market</h1>
        </div>
        <div className="flex items-center gap-2">
          {updated && (
            <span className="text-[10px] text-muted font-mono hidden sm:block">
              {updated.toLocaleTimeString([], {
                hour: '2-digit', minute: '2-digit', second: '2-digit',
              })}
            </span>
          )}
          <button
            onClick={fetchMarket}
            className={`p-1.5 rounded-lg hover:bg-card text-muted
                        transition-all ${loading ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SOL Chart */}
      {solHistory.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs text-muted font-mono mb-3">SOL / USD — 24h</p>
          {(() => {
            const vW = 400, vH = 80;
            const n   = solHistory.length;
            const min = Math.min(...solHistory);
            const max = Math.max(...solHistory);
            const rng = max - min || 1;
            const pos = solHistory[n-1] >= solHistory[0];
            const col = pos ? '#00FFA3' : '#FF6B6B';
            const pts = solHistory.map((v, i) => ({
              x: (i / (n - 1)) * vW,
              y: vH - ((v - min) / rng) * vH,
            }));
            const d = pts.map((p, i) =>
              `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`
            ).join(' ');
            return (
              <svg viewBox={`0 0 ${vW} ${vH}`} style={{ width: '100%', height: 80 }}
                   preserveAspectRatio="none">
                <defs>
                  <linearGradient id="mcg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={col} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={col} stopOpacity="0"   />
                  </linearGradient>
                </defs>
                <path d={`${d} L${vW} ${vH} L0 ${vH} Z`} fill="url(#mcg)" />
                <path d={d} fill="none" stroke={col} strokeWidth="2"
                      strokeLinecap="round" />
                <circle cx={pts[n-1].x} cy={pts[n-1].y} r="3"
                        fill={col} stroke="#161B22" strokeWidth="2" />
              </svg>
            );
          })()}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search tokens..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border
                     text-sm focus:outline-none focus:border-primary/60 transition-colors"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold
                        transition-all
              ${category === c.id
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-card border border-border text-muted hover:text-text'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Token list */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-card-2/50
                        border-b border-border text-xs text-muted">
          <span className="w-5" />
          <span className="flex-1">Token</span>
          <span className="hidden sm:block w-16" />
          <div className="text-right flex-shrink-0 space-x-3">
            <button
              onClick={() => toggleSort('mcap')}
              className={`hover:text-text transition-colors
                ${sort === 'mcap' ? 'text-text font-semibold' : ''}`}
            >
              Price
            </button>
          </div>
          <button
            onClick={() => toggleSort('change')}
            className={`hidden lg:block w-20 text-right hover:text-text
                        transition-colors
              ${sort === 'change' ? 'text-text font-semibold' : ''}`}
          >
            Mcap
          </button>
        </div>

        {loading && tokens.length === 0 ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="w-5 h-3 bg-card-2 rounded shimmer" />
                <div className="w-9 h-9 rounded-full bg-card-2 shimmer" />
                <div className="flex-1 space-y-1">
                  <div className="w-24 h-3 bg-card-2 rounded shimmer" />
                  <div className="w-12 h-2.5 bg-card-2 rounded shimmer" />
                </div>
                <div className="w-16 h-3 bg-card-2 rounded shimmer" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted">No tokens found</p>
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto">
            {filtered.map((token, i) => (
              <TokenRow key={token.id} token={token} rank={i + 1} />
            ))}
          </div>
        )}

        {/* Opportunity */}
        {tokens.length > 0 && (() => {
          const best = [...tokens].sort(
            (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
          )[0];
          const pos = best.price_change_percentage_24h >= 0;
          return (
            <div className={`m-4 p-3 rounded-xl border text-xs
              ${pos ? 'bg-accent/5 border-accent/20' : 'bg-danger/5 border-danger/20'}`}>
              <div className="flex items-center gap-2">
                <Flame className={`w-4 h-4 ${pos ? 'text-accent' : 'text-danger'}`} />
                <p className={`font-bold ${pos ? 'text-accent' : 'text-danger'}`}>
                  {pos ? 'Top Performer' : 'Watch Out'}
                </p>
              </div>
              <p className="text-muted mt-1">
                <span className="text-text font-semibold">
                  {best.symbol.toUpperCase()}
                </span>{' '}
                is {pos ? 'up' : 'down'}{' '}
                <span className={`font-mono font-bold
                  ${pos ? 'text-accent' : 'text-danger'}`}>
                  {pos ? '+' : ''}{best.price_change_percentage_24h.toFixed(2)}%
                </span>{' '}
                — {pos
                  ? 'Consider a momentum agent.'
                  : 'Consider a dip-buy agent.'}
              </p>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
