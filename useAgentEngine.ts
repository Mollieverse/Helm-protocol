'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { AgentRule, Execution, PriceData, Condition } from '@/lib/types';
import { buildDemoTransaction, nanoId, explorerLink } from '@/lib/solana';

// ─── Condition evaluator ──────────────────────────────────────────────────────
function isConditionMet(
  condition: Condition,
  price: PriceData,
): boolean {
  const { change24h } = price;
  switch (condition) {
    case 'price_drop_5':  return change24h <= -5;
    case 'price_drop_10': return change24h <= -10;
    case 'price_rise_5':  return change24h >= 5;
    case 'price_rise_10': return change24h >= 10;
    case 'always':        return true;
    default:              return false;
  }
}

interface UseAgentEngineProps {
  price: PriceData;
  onBalanceRefresh: () => void;
}

export function useAgentEngine({ price, onBalanceRefresh }: UseAgentEngineProps) {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection }                             = useConnection();

  const [agents, setAgents]         = useState<AgentRule[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [processing, setProcessing] = useState(false);

  const priceRef = useRef(price);
  useEffect(() => { priceRef.current = price; }, [price]);

  // ─── Execute a single agent rule ─────────────────────────────────────────
  const executeAgent = useCallback(
    async (agent: AgentRule) => {
      if (!publicKey || !connected || processing) return;
      setProcessing(true);

      // Optimistic: mark as triggered
      setAgents(prev =>
        prev.map(a =>
          a.id === agent.id
            ? { ...a, status: 'triggered', triggeredAt: new Date() }
            : a,
        ),
      );

      const execId = nanoId();
      const execEntry: Execution = {
        id:        execId,
        agentId:   agent.id,
        agentName: agent.name,
        action:    agent.action,
        amount:    agent.amount,
        timestamp: new Date(),
        txHash:    null,
        status:    'pending',
        price:     priceRef.current.current,
      };
      setExecutions(prev => [execEntry, ...prev]);

      try {
        if (agent.action === 'send_alert') {
          // No on-chain tx needed; resolve immediately
          await new Promise(r => setTimeout(r, 800));
          setExecutions(prev =>
            prev.map(e =>
              e.id === execId
                ? { ...e, status: 'success', txHash: 'alert-only' }
                : e,
            ),
          );
        } else {
          // Real on-chain self-transfer (devnet dust)
          const tx = buildDemoTransaction(publicKey);
          const { blockhash } = await connection.getLatestBlockhash();
          tx.recentBlockhash = blockhash;
          tx.feePayer = publicKey;

          const sig = await sendTransaction(tx, connection);
          await connection.confirmTransaction(sig, 'confirmed');

          setExecutions(prev =>
            prev.map(e =>
              e.id === execId ? { ...e, status: 'success', txHash: sig } : e,
            ),
          );
          onBalanceRefresh();
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error('Agent execution error:', msg);
        setExecutions(prev =>
          prev.map(e =>
            e.id === execId ? { ...e, status: 'failed' } : e,
          ),
        );
        setAgents(prev =>
          prev.map(a =>
            a.id === agent.id ? { ...a, status: 'error' } : a,
          ),
        );
      } finally {
        // Return to monitoring after 3 s
        setTimeout(() => {
          setAgents(prev =>
            prev.map(a =>
              a.id === agent.id && a.status !== 'paused' && a.status !== 'error'
                ? { ...a, status: 'monitoring' }
                : a,
            ),
          );
          setProcessing(false);
        }, 3_000);
      }
    },
    [publicKey, connected, processing, connection, sendTransaction, onBalanceRefresh],
  );

  // ─── Monitoring loop: check every 8 s ────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      if (processing) return;
      agents.forEach(agent => {
        if (agent.status !== 'monitoring') return;
        if (isConditionMet(agent.condition, priceRef.current)) {
          executeAgent(agent);
        }
      });
    }, 8_000);
    return () => clearInterval(id);
  }, [agents, processing, executeAgent]);

  // ─── Public API ───────────────────────────────────────────────────────────
  const addAgent = useCallback((rule: Omit<AgentRule, 'id' | 'createdAt' | 'status'>) => {
    const newAgent: AgentRule = {
      ...rule,
      id:        nanoId(),
      status:    'monitoring',
      createdAt: new Date(),
    };
    setAgents(prev => [newAgent, ...prev]);
    return newAgent;
  }, []);

  const removeAgent = useCallback((id: string) => {
    setAgents(prev => prev.filter(a => a.id !== id));
  }, []);

  const togglePause = useCallback((id: string) => {
    setAgents(prev =>
      prev.map(a =>
        a.id === id
          ? { ...a, status: a.status === 'paused' ? 'monitoring' : 'paused' }
          : a,
      ),
    );
  }, []);

  const triggerNow = useCallback((agent: AgentRule) => {
    executeAgent(agent);
  }, [executeAgent]);

  return {
    agents, executions, processing,
    addAgent, removeAgent, togglePause, triggerNow,
  };
}
