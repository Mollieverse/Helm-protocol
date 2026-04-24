'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { PriceData } from '@/lib/types';

export function useSolPrice(intervalMs = 30_000) {
  const [price, setPrice]     = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef            = useRef(true);

  const fetchPrice = useCallback(async () => {
    try {
      const res = await fetch('/api/price');
      if (!res.ok) return;
      const data = await res.json() as PriceData;
      if (!mountedRef.current) return;
      setPrice(prev => {
        if (
          prev?.current   === data.current &&
          prev?.change24h === data.change24h
        ) return prev;
        return data;
      });
    } catch {
      // keep last known value silently
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchPrice();
    const id = setInterval(fetchPrice, intervalMs);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [fetchPrice, intervalMs]);

  return { price, loading };
}
