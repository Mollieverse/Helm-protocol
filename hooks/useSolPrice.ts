'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { PriceData } from '@/lib/types';

const INITIAL: PriceData = {
  current:   148.5,
  change24h: 0,
  history:   Array.from({ length: 24 }, () => 148.5),
};

export function useSolPrice(intervalMs = 30_000) {
  const [price, setPrice]     = useState<PriceData>(INITIAL);
  const [loading, setLoading] = useState(true);
  const mountedRef            = useRef(true);

  const fetchPrice = useCallback(async () => {
    try {
      const res  = await fetch('/api/price');
      if (!res.ok) return;
      const data = await res.json() as PriceData;
      if (!mountedRef.current) return;
      setPrice(prev =>
        prev.current === data.current && prev.change24h === data.change24h ? prev : data,
      );
    } catch { /* keep last value */ }
    finally { if (mountedRef.current) setLoading(false); }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchPrice();
    const id = setInterval(fetchPrice, intervalMs);
    return () => { mountedRef.current = false; clearInterval(id); };
  }, [fetchPrice, intervalMs]);

  return { price, loading };
}
