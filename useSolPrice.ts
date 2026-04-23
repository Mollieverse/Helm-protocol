'use client';
import { useState, useEffect, useCallback } from 'react';
import { PriceData } from '@/lib/types';

const INITIAL: PriceData = {
  current:   148.5,
  change24h: 0,
  history:   Array.from({ length: 20 }, () => 148.5),
};

export function useSolPrice(intervalMs = 6_000) {
  const [price, setPrice]     = useState<PriceData>(INITIAL);
  const [loading, setLoading] = useState(true);

  const fetchPrice = useCallback(async () => {
    try {
      const res  = await fetch('/api/price');
      const data = await res.json() as PriceData;
      setPrice(data);
    } catch {
      // silently keep last value
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrice();
    const id = setInterval(fetchPrice, intervalMs);
    return () => clearInterval(id);
  }, [fetchPrice, intervalMs]);

  return { price, loading };
}
