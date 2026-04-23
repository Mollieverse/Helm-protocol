import { NextResponse } from 'next/server';

// ─── Simple mock price API ────────────────────────────────────────────────────
// In production, replace with: https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd

let basePrice = 148.5;
let lastFetch = 0;
let cachedPrice = basePrice;
let history: number[] = Array.from({ length: 20 }, (_, i) =>
  basePrice + (Math.random() - 0.5) * 10,
);

export async function GET() {
  const now = Date.now();

  // Throttle: only update every 5 s to simulate live feed
  if (now - lastFetch > 5_000) {
    // Random walk: ±0.8%
    const delta = cachedPrice * (Math.random() - 0.5) * 0.016;
    cachedPrice = Math.max(50, cachedPrice + delta);
    history = [...history.slice(1), cachedPrice];
    lastFetch = now;
  }

  const change24h = ((cachedPrice - basePrice) / basePrice) * 100;

  return NextResponse.json({
    current:   parseFloat(cachedPrice.toFixed(2)),
    change24h: parseFloat(change24h.toFixed(2)),
    history,
  });
}
