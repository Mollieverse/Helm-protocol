import { NextResponse } from 'next/server';

const PRICE_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true';
const HISTORY_URL =
  'https://api.coingecko.com/api/v3/coins/solana/market_chart?vs_currency=usd&days=1&interval=hourly';

let cache: { current: number; change24h: number; history: number[]; ts: number } | null = null;
const TTL = 30_000;

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.ts < TTL) {
    return NextResponse.json({ current: cache.current, change24h: cache.change24h, history: cache.history });
  }
  try {
    const [pr, hr] = await Promise.all([
      fetch(PRICE_URL,   { next: { revalidate: 30 } }),
      fetch(HISTORY_URL, { next: { revalidate: 30 } }),
    ]);
    const pd = await pr.json();
    const hd = await hr.json();
    const current   = pd.solana.usd as number;
    const change24h = pd.solana.usd_24h_change as number;
    const history   = ((hd.prices as [number, number][]) ?? []).slice(-24).map(([, p]) => parseFloat(p.toFixed(2)));
    cache = { current, change24h, history, ts: now };
    return NextResponse.json({ current: parseFloat(current.toFixed(2)), change24h: parseFloat(change24h.toFixed(2)), history });
  } catch {
    if (cache) return NextResponse.json({ current: cache.current, change24h: cache.change24h, history: cache.history });
    return NextResponse.json({ current: 148.5, change24h: 0, history: Array.from({ length: 24 }, () => 148.5) });
  }
}
