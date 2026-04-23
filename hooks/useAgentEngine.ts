'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { AgentRule, Execution, PriceData, ConditionType } from '@/lib/types';
import { buildDemoTransaction, nanoId } from '@/lib/solana';

function isConditionMet(type: ConditionType, pct: number, change24h: number): boolean {
  if (type === 'price_drops') return change24h <= -pct;
  if (type === 'price_rises') return change24h >= pct;
  return false;
}

interface Props {
  price:            PriceData;
  onBalanceRefresh: () => void;
}

export function useAgentEngine({ price, onBalanceRefresh }: Props) {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection }                            = useConnection();

  const [agents,     setAgents]     = useState<AgentRule[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [processing, setProcessing] = useState(false);

  const processingRef       = useRef(false);
  const agentsRef           = useRef(agents);
  const mountedRef          = useRef(true);
  const onBalanceRefreshRef = useRef(onBalanceRefresh);
  // tokenId -> { current, change24h }
  const tokenPricesRef      = useRef<Record<string, { current: number; change24h: number }>>({});

  useEffect(() => { agentsRef.current           = agents;           }, [agents]);
  useEffect(() => { onBalanceRefreshRef.current = onBalanceRefresh; }, [onBalanceRefresh]);

  // Keep SOL price synced from prop
  useEffect(() => {
    tokenPricesRef.current['solana'] = { current: price.current, change24h: price.change24h };
  }, [price]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Fetch prices for all tokens in agents (non-SOL or all)
  const fetchTokenPrices = useCallback(async () => {
    const ids = [...new Set(agentsRef.current.map(a => a.token.id))];
    if (ids.length === 0) return;
    try {
      const res  = await fetch(`/api/token-prices?ids=${ids.join(',')}`);
      const data = await res.json() as Record<string, { usd: number; usd_24h_change: number }>;
      for (const [id, info] of Object.entries(data)) {
        tokenPricesRef.current[id] = { current: info.usd, change24h: info.usd_24h_change };
      }
    } catch { /* keep last */ }
  }, []);

  // Refresh token prices every 30s
  useEffect(() => {
    fetchTokenPrices();
    const id = setInterval(fetchTokenPrices, 30_000);
    return () => clearInterval(id);
  }, [fetchTokenPrices]);

  // Execute a single agent
  const executeAgent = useCallback(async (agent: AgentRule) => {
    if (!publicKey || !connected || processingRef.current) return;
    processingRef.current = true;
    if (mountedRef.current) setProcessing(true);

    setAgents(prev =>
      prev.map(a => a.id === agent.id ? { ...a, status: 'triggered', triggeredAt: new Date() } : a),
    );

    const execId = nanoId();
    const tokenPrice = tokenPricesRef.current[agent.token.id]?.current ?? 0;

    setExecutions(prev => [{
      id:          execId,
      agentId:     agent.id,
      agentName:   agent.name,
      tokenSymbol: agent.token.symbol,
      action:      agent.action,
      amount:      agent.amount,
      timestamp:   new Date(),
      txHash:      null,
      status:      'pending',
      price:       tokenPrice,
    }, ...prev]);

    try {
      if (agent.action === 'alert') {
        await new Promise(r => setTimeout(r, 800));
        if (mountedRef.current)
          setExecutions(prev => prev.map(e => e.id === execId ? { ...e, status: 'success', txHash: 'alert-only' } : e));
      } else {
        const tx = buildDemoTransaction(publicKey);
        const { blockhash } = await connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        tx.feePayer        = publicKey;
        const sig = await sendTransaction(tx, connection);
        await connection.confirmTransaction(sig, 'confirmed');
        if (mountedRef.current) {
          setExecutions(prev => prev.map(e => e.id === execId ? { ...e, status: 'success', txHash: sig } : e));
          onBalanceRefreshRef.current();
        }
      }
    } catch (err) {
      console.error('Agent error:', err instanceof Error ? err.message : err);
      if (mountedRef.current) {
        setExecutions(prev => prev.map(e => e.id === execId ? { ...e, status: 'failed' } : e));
        setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: 'error' } : a));
      }
    } finally {
      setTimeout(() => {
        if (!mountedRef.current) return;
        setAgents(prev =>
          prev.map(a =>
            a.id === agent.id && a.status !== 'paused' && a.status !== 'error'
              ? { ...a, status: 'monitoring' } : a,
          ),
        );
        setProcessing(false);
        processingRef.current = false;
      }, 3_000);
    }
  }, [publicKey, connected, connection, sendTransaction]);

  // Monitoring loop — reads from refs, never re-subscribes
  useEffect(() => {
    const id = setInterval(() => {
      if (processingRef.current) return;
      agentsRef.current.forEach(agent => {
        if (agent.status !== 'monitoring') return;
        const tp = tokenPricesRef.current[agent.token.id];
        if (!tp) return;
        if (isConditionMet(agent.conditionType, agent.conditionPct, tp.change24h)) {
          executeAgent(agent);
        }
      });
    }, 10_000);
    return () => clearInterval(id);
  }, [executeAgent]);

  const addAgent = useCallback(
    (rule: Omit<AgentRule, 'id' | 'createdAt' | 'status'>) => {
      const a: AgentRule = { ...rule, id: nanoId(), status: 'monitoring', createdAt: new Date() };
      setAgents(prev => [a, ...prev]);
      // Immediately fetch price for the new token
      fetchTokenPrices();
      return a;
    }, [fetchTokenPrices],
  );

  const removeAgent = useCallback((id: string) => setAgents(p => p.filter(a => a.id !== id)), []);
  const togglePause = useCallback((id: string) =>
    setAgents(p => p.map(a =>
      a.id === id ? { ...a, status: a.status === 'paused' ? 'monitoring' : 'paused' } : a,
    )), []);
  const triggerNow = useCallback((agent: AgentRule) => executeAgent(agent), [executeAgent]);

  return { agents, executions, processing, addAgent, removeAgent, togglePause, triggerNow };
                 }
