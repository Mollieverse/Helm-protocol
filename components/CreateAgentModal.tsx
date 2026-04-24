'use client';
import { useState, useMemo, useEffect } from 'react';
import { X, Bot, Zap, Search, TrendingDown, TrendingUp, ChevronDown, Wallet, Star } from 'lucide-react';
import { ConditionType, Action, SolanaToken } from '@/lib/types';
import { SOLANA_TOKENS } from '@/lib/constants';
import { useWalletTokens } from '@/hooks/useWalletTokens';

interface Props {
  onClose:  () => void;
  onCreate: (data: {
    name:          string;
    token:         SolanaToken;
    conditionType: ConditionType;
    conditionPct:  number;
    action:        Action;
    amount:        number;
  }) => void;
}

const ACTIONS: { value: Action; label: string; color: string }[] = [
  { value: 'buy',   label: '🟢 Buy',   color: 'border-accent/60 bg-accent/10 text-accent'         },
  { value: 'sell',  label: '🔴 Sell',  color: 'border-danger/60 bg-danger/10 text-danger'          },
  { value: 'alert', label: '🔔 Alert', color: 'border-secondary/60 bg-secondary/10 text-secondary' },
];

function fmtPrice(p: number): string {
  if (p < 0.000001) return `$${p.toFixed(10)}`;
  if (p < 0.0001)   return `$${p.toFixed(8)}`;
  if (p < 0.01)     return `$${p.toFixed(6)}`;
  if (p < 1)        return `$${p.toFixed(4)}`;
  return `$${p.toFixed(2)}`;
}

function fmtBalance(b: number): string {
  if (b < 0.0001) return b.toExponential(2);
  if (b < 1)      return b.toFixed(6);
  if (b < 1000)   return b.toFixed(2);
  return b.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function CreateAgentModal({ onClose, onCreate }: Props) {
  const { tokens: walletTokens, loading: walletLoading } = useWalletTokens();

  const [tokenSearch,   setTokenSearch]   = useState('');
  const [showTokenList, setShowTokenList] = useState(false);
  const [selectedToken, setSelectedToken] = useState<SolanaToken>(SOLANA_TOKENS[0]);
  const [conditionType, setConditionType] = useState<ConditionType>('price_drops');
  const [conditionPct,  setConditionPct]  = useState('5');
  const [action,        setAction]        = useState<Action>('buy');
  const [amount,        setAmount]        = useState('0.01');
  const [name,          setName]          = useState('');
  const [activeTab,     setActiveTab]     = useState<'popular' | 'wallet'>('popular');

  const autoName = `${selectedToken.symbol} ${conditionType === 'price_drops' ? 'Dip Buyer' : 'Moon Rider'}`;

  // Convert wallet tokens to SolanaToken format
  const walletAsSolanaTokens: SolanaToken[] = useMemo(() =>
    walletTokens.map(t => ({
      id:      t.mint,
      symbol:  t.symbol,
      name:    t.name,
      mint:    t.mint,
      logo:    t.logo,
      balance: t.balance,
    })),
    [walletTokens],
  );

  // Filtered popular tokens
  const filteredPopular = useMemo(() =>
    SOLANA_TOKENS.filter(t =>
      t.symbol.toLowerCase().includes(tokenSearch.toLowerCase()) ||
      t.name.toLowerCase().includes(tokenSearch.toLowerCase()),
    ),
    [tokenSearch],
  );

  // Filtered wallet tokens
  const filteredWallet = useMemo(() =>
    walletAsSolanaTokens.filter(t =>
      t.symbol.toLowerCase().includes(tokenSearch.toLowerCase()) ||
      t.name.toLowerCase().includes(tokenSearch.toLowerCase()) ||
      (t.mint ?? '').toLowerCase().includes(tokenSearch.toLowerCase()),
    ),
    [walletAsSolanaTokens, tokenSearch],
  );

  // Switch to wallet tab automatically if user has wallet tokens
  useEffect(() => {
    if (walletTokens.length > 0 && activeTab === 'popular') {
      // Don't auto-switch, let user choose
    }
  }, [walletTokens, activeTab]);

  const handleSelectToken = (t: SolanaToken) => {
    setSelectedToken(t);
    setShowTokenList(false);
    setTokenSearch('');
  };

  const handleSubmit = () => {
    const pct = parseFloat(conditionPct);
    const amt = parseFloat(amount);
    if (isNaN(pct) || pct <= 0 || isNaN(amt) || amt <= 0) return;
    onCreate({
      name:          name.trim() || autoName,
      token:         selectedToken,
      conditionType,
      conditionPct:  pct,
      action,
      amount:        amt,
    });
    onClose();
  };

  const TokenAvatar = ({ token, size = 'sm' }: { token: SolanaToken; size?: 'sm' | 'md' }) => {
    const cls = size === 'md'
      ? 'w-10 h-10 text-sm'
      : 'w-7 h-7 text-xs';

    if (token.logo) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={token.logo}
          alt={token.symbol}
          className={`${cls} rounded-full object-cover flex-shrink-0`}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      );
    }
    return (
      <div className={`${cls} rounded-full bg-gradient-to-br from-primary/30 to-secondary/30
                       flex items-center justify-center font-bold font-mono flex-shrink-0`}>
        {token.symbol.slice(0, 2).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:w-[500px] bg-card border border-border rounded-t-2xl
                      sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-base">Create Agent</h2>
              <p className="text-xs text-muted">Any Solana token • Meme coins supported</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-card-2 rounded-lg text-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto p-5 space-y-4 flex-1">

          {/* ── Token selector ── */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider">Token</label>
            <div className="relative">
              <button
                onClick={() => setShowTokenList(o => !o)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg
                           bg-card-2 border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <TokenAvatar token={selectedToken} />
                  <div className="text-left">
                    <p className="text-sm font-semibold">{selectedToken.symbol}</p>
                    <p className="text-xs text-muted truncate max-w-[200px]">{selectedToken.name}</p>
                  </div>
                  {selectedToken.balance != null && (
                    <span className="ml-1 text-xs text-accent font-mono">
                      {fmtBalance(selectedToken.balance)}
                    </span>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-muted transition-transform ${showTokenList ? 'rotate-180' : ''}`} />
              </button>

              {showTokenList && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-card border border-border
                                rounded-xl shadow-xl overflow-hidden">
                  {/* Search */}
                  <div className="p-2 border-b border-border">
                    <div className="flex items-center gap-2 px-2 py-1.5 bg-card-2 rounded-lg">
                      <Search className="w-3.5 h-3.5 text-muted flex-shrink-0" />
                      <input
                        autoFocus
                        value={tokenSearch}
                        onChange={e => setTokenSearch(e.target.value)}
                        placeholder="Search name, symbol or paste mint..."
                        className="bg-transparent text-sm outline-none flex-1 placeholder-muted/50"
                      />
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-border">
                    <button
                      onClick={() => setActiveTab('popular')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors
                        ${activeTab === 'popular' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted hover:text-text'}`}
                    >
                      <Star className="w-3 h-3" />
                      Popular ({SOLANA_TOKENS.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('wallet')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors
                        ${activeTab === 'wallet' ? 'text-accent border-b-2 border-accent bg-accent/5' : 'text-muted hover:text-text'}`}
                    >
                      <Wallet className="w-3 h-3" />
                      My Wallet {walletTokens.length > 0 ? `(${walletTokens.length})` : ''}
                    </button>
                  </div>

                  {/* Token list */}
                  <div className="max-h-56 overflow-y-auto">
                    {activeTab === 'popular' ? (
                      filteredPopular.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted">No tokens found</div>
                      ) : filteredPopular.map(t => (
                        <button
                          key={t.id}
                          onClick={() => handleSelectToken(t)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-card-2
                                     transition-colors text-left
                                     ${selectedToken.id === t.id ? 'bg-primary/10' : ''}`}
                        >
                          <TokenAvatar token={t} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold">{t.symbol}</p>
                            <p className="text-xs text-muted truncate">{t.name}</p>
                          </div>
                          {selectedToken.id === t.id && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                          )}
                        </button>
                      ))
                    ) : walletLoading ? (
                      <div className="p-6 text-center">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent
                                        rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-xs text-muted">Loading your tokens...</p>
                      </div>
                    ) : filteredWallet.length === 0 ? (
                      <div className="p-6 text-center">
                        <Wallet className="w-8 h-8 text-muted/40 mx-auto mb-2" />
                        <p className="text-xs text-muted font-semibold mb-1">No tokens found</p>
                        <p className="text-xs text-muted/60">
                          {walletTokens.length === 0
                            ? 'Your wallet has no SPL tokens yet'
                            : 'Try a different search'}
                        </p>
                      </div>
                    ) : filteredWallet.map(t => {
                      const walletT = walletTokens.find(w => w.mint === t.mint);
                      const usdVal  = walletT?.balance && walletT?.price
                        ? (walletT.balance * walletT.price)
                        : null;
                      return (
                        <button
                          key={t.id}
                          onClick={() => handleSelectToken(t)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-card-2
                                     transition-colors text-left
                                     ${selectedToken.id === t.id ? 'bg-accent/10' : ''}`}
                        >
                          <TokenAvatar token={t} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold">{t.symbol}</p>
                              {/* Meme badge for unknown tokens */}
                              {t.symbol.includes('...') && (
                                <span className="text-[9px] px-1 py-0.5 rounded bg-warning/20 text-warning font-bold">
                                  DEGEN
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted truncate">{t.name}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {walletT?.balance != null && (
                              <p className="text-xs font-mono text-accent">
                                {fmtBalance(walletT.balance)}
                              </p>
                            )}
                            {usdVal != null && (
                              <p className="text-[10px] text-muted font-mono">
                                {fmtPrice(usdVal)}
                              </p>
                            )}
                          </div>
                          {selectedToken.id === t.id && (
                            <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Condition ── */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider">IF Condition</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {([
                { val: 'price_drops', label: 'Price Drops', Icon: TrendingDown, color: 'border-danger/50 bg-danger/10 text-danger' },
                { val: 'price_rises', label: 'Price Rises', Icon: TrendingUp,   color: 'border-accent/50 bg-accent/10 text-accent' },
              ] as const).map(({ val, label, Icon, color }) => (
                <button
                  key={val}
                  onClick={() => setConditionType(val)}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border
                             text-sm font-semibold transition-all
                             ${conditionType === val
                               ? color
                               : 'border-border bg-card-2 text-muted hover:border-border/80'}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-card-2 border border-border">
              <span className="text-sm text-muted flex-shrink-0">by</span>
              <input
                type="number"
                value={conditionPct}
                onChange={e => setConditionPct(e.target.value)}
                min="0.1" max="100" step="0.5"
                className="flex-1 bg-transparent text-center text-xl font-bold font-mono
                           outline-none text-text w-16"
              />
              <span className="text-xl font-bold text-muted flex-shrink-0">%</span>
            </div>
            <p className="text-xs text-muted text-center">
              Triggers when{' '}
              <span className="text-text font-semibold">{selectedToken.symbol}</span>{' '}
              {conditionType === 'price_drops' ? 'drops' : 'rises'}{' '}
              <span className="text-text font-semibold">{conditionPct || '?'}%</span> in 24h
            </p>
          </div>

          {/* ── Action ── */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider">THEN Action</label>
            <div className="grid grid-cols-3 gap-2">
              {ACTIONS.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => setAction(value)}
                  className={`px-3 py-2.5 rounded-lg border text-sm font-semibold transition-all
                    ${action === value
                      ? color
                      : 'border-border bg-card-2 text-muted hover:border-border/80'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Amount ── */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider">Amount (SOL)</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min="0.001" step="0.01"
                className="w-full px-3 py-2.5 pr-14 rounded-lg bg-card-2 border border-border
                           text-sm font-mono focus:outline-none focus:border-primary/60 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xs font-mono">SOL</span>
            </div>
          </div>

          {/* ── Name ── */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider">Agent Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={autoName}
              className="w-full px-3 py-2.5 rounded-lg bg-card-2 border border-border
                         text-sm focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>

          {/* ── Summary ── */}
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted leading-relaxed">
            <span className="text-primary font-semibold">Agent summary: </span>
            When <span className="text-text font-semibold">{selectedToken.symbol}</span>{' '}
            {conditionType === 'price_drops' ? 'drops' : 'rises'}{' '}
            <span className="text-text font-semibold">{conditionPct || '?'}%</span> →{' '}
            <span className="text-text font-semibold capitalize">{action}</span>{' '}
            <span className="text-text font-semibold">{amount || '?'} SOL</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border flex-shrink-0">
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
