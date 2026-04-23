'use client';
import { useState } from 'react';
import { X, Bot, Zap } from 'lucide-react';
import { Condition, Action } from '@/lib/types';
import { CONDITION_LABELS, ACTION_LABELS } from '@/lib/constants';

interface Props {
  onClose:  () => void;
  onCreate: (data: { name: string; condition: Condition; action: Action; amount: number }) => void;
}

const CONDITIONS = Object.entries(CONDITION_LABELS) as [Condition, string][];
const ACTIONS    = Object.entries(ACTION_LABELS)    as [Action,    string][];

export function CreateAgentModal({ onClose, onCreate }: Props) {
  const [name,      setName]      = useState('My Agent');
  const [condition, setCondition] = useState<Condition>('price_drop_5');
  const [action,    setAction]    = useState<Action>('buy_sol');
  const [amount,    setAmount]    = useState('0.01');

  const handleSubmit = () => {
    const parsed = parseFloat(amount);
    if (!name.trim() || isNaN(parsed) || parsed <= 0) return;
    onCreate({ name: name.trim(), condition, action, amount: parsed });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:w-[480px] bg-card border border-border rounded-t-2xl sm:rounded-2xl
                      shadow-2xl shadow-black/60 animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-base">Create Agent</h2>
              <p className="text-xs text-muted">Set a condition and action</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-card-2 rounded-lg text-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider">Agent Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Dip Buyer"
              className="w-full px-3 py-2.5 rounded-lg bg-card-2 border border-border
                         text-sm focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>

          {/* Condition */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider">
              IF Condition
            </label>
            <div className="grid grid-cols-1 gap-2">
              {CONDITIONS.map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setCondition(val)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left text-sm transition-all
                    ${condition === val
                      ? 'border-primary/60 bg-primary/10 text-text'
                      : 'border-border bg-card-2 text-muted hover:border-border/80'
                    }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${condition === val ? 'bg-primary' : 'bg-muted/40'}`} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Action */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider">
              THEN Action
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ACTIONS.map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setAction(val)}
                  className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all
                    ${action === val
                      ? 'border-accent/60 bg-accent/10 text-accent'
                      : 'border-border bg-card-2 text-muted hover:border-border/80'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider">
              Amount (SOL)
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min="0.001"
                step="0.01"
                className="w-full px-3 py-2.5 pr-16 rounded-lg bg-card-2 border border-border
                           text-sm font-mono focus:outline-none focus:border-primary/60 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xs font-mono">SOL</span>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                       bg-gradient-to-r from-primary to-secondary text-white font-bold
                       hover:opacity-90 transition-all active:scale-[0.98]
                       shadow-lg shadow-primary/20"
          >
            <Zap className="w-4 h-4" />
            Deploy Agent
          </button>
        </div>
      </div>
    </div>
  );
}
