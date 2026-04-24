import { NextResponse } from 'next/server';

// Cache: id/mint -> { usd, usd_24h_change, ts }
const cache: Record<string, { usd: number; usd_24h_change: number; ts: number }> = {};
const TTL = 30_000;

// CoinGecko IDs for known tokens
const COINGECKO_IDS = new Set([
  'solana', 'jito-governance-token', 'raydium', 'bonk', 'dogwifcoin',
  'jupiter-exchange-solana', 'pyth-network', 'render-token', 'helium',
  'orca-so', 'marinade', 'drift-protocol', 'kamino', 'tensor', 'popcat',
  'cat-in-a-dogs-world', 'stepn', 'nosana', 'parcl', 'myro',
]);

async function fetchCoinGeckoPrices(ids: string[]): Promise<void> {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`;
  const res  = await fetch(url, { next: { revalidate: 30 } });
  const data = await res.json() as Record<string, { usd: number; usd_24h_change: number }>;
  const now  = Date.now();
  for (const [id, info] of Object.entries(data)) {
    cache[id] = { usd: info.usd, usd_24h_change: info.usd_24h_change ?? 0, ts: now };
  }
}

async function fetchJupiterPrices(mints: string[]): Promise<void> {
  const url  = `https://price.jup.ag/v6/price?ids=${mints.join(',')}`;
  const res  = await fetch(url, { next: { revalidate: 30 } });
  const data = await res.json() as { data: Record<string, { price: number } | null> };
  const now  = Date.now();
  for (const [mint, info] of Object.entries(data.data ?? {})) {
    if (info?.price) {
      cache[mint] = { usd: info.price, usd_24h_change: 0, ts: now };
    }
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids') || '';
  if (!ids) return NextResponse.json({});

  const now    = Date.now();
  const idList = ids.split(',').map(s => s.trim()).filter(Boolean);
  const stale  = idList.filter(id => !cache[id] || now - cache[id].ts > TTL);

  if (stale.length > 0) {
    // Split into CoinGecko IDs vs SPL mint addresses
    const cgIds   = stale.filter(id => COINGECKO_IDS.has(id));
    // Mint addresses are base58 and longer than typical CoinGecko IDs
    const mintIds = stale.filter(id => !COINGECKO_IDS.has(id) && id.length > 20);

    await Promise.allSettled([
      cgIds.length   > 0 ? fetchCoinGeckoPrices(cgIds)   : Promise.resolve(),
      mintIds.length > 0 ? fetchJupiterPrices(mintIds)   : Promise.resolve(),
    ]);
  }

  const result: Record<string, { usd: number; usd_24h_change: number }> = {};
  for (const id of idList) {
    if (cache[id]) {
      result[id] = { usd: cache[id].usd, usd_24h_change: cache[id].usd_24h_change };
    }
  }

  return NextResponse.json(result);
}
