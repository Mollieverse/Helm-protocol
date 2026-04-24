'use client';

import { useState, useCallback, memo } from 'react';
import { Plus, Zap, Bot, RefreshCw, ArrowRight, Shield, Activity, ChevronRight } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';

import { Sidebar }          from '@/components/Sidebar';
import { BottomNav }        from '@/components/BottomNav';
import { WalletButton }     from '@/components/WalletButton';
import { BalanceCard }      from '@/components/BalanceCard';
import { AgentCard }        from '@/components/AgentCard';
import { CreateAgentModal } from '@/components/CreateAgentModal';
import { ExecutionLog }     from '@/components/ExecutionLog';
import { MarketCard }       from '@/components/MarketCard';
import { SettingsPanel }    from '@/components/SettingsPanel';
import { StatsBar }         from '@/components/StatsBar';
import { EmptyAgentsState } from '@/components/EmptyAgentsState';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { useSolPrice }      from '@/hooks/useSolPrice';
import { useAgentEngine }   from '@/hooks/useAgentEngine';
import { AgentRule }        from '@/lib/types';

// ─── Landing page shown to non-connected users ────────────────────────────────
function LandingPage() {
  const steps = [
    {
      icon: '🔗',
      title: 'Connect Your Wallet',
      desc:  'Link your Phantom or Solflare wallet. We never hold your funds — you stay in full control at all times.',
    },
    {
      icon: '🤖',
      title: 'Create an Agent Rule',
      desc:  'Pick any Solana token, set a condition like "SOL drops 5%" and an action like "Buy SOL". Done in seconds.',
    },
    {
      icon: '📡',
      title: 'Agent Monitors 24/7',
      desc:  'Your agent watches live market prices continuously. No need to stare at charts — we do it for you.',
    },
    {
      icon: '⚡',
      title: 'Auto-Executes On-Chain',
      desc:  'When your condition is met, AutoPilot builds the transaction. You approve it in your wallet — one tap.',
    },
  ];

  const features = [
    { icon: <Shield  className="w-4 h-4" />, label: 'Non-custodial',    desc: 'Your keys, your coins. Always.' },
    { icon: <Bot     className="w-4 h-4" />, label: 'Multi-agent',      desc: 'Run multiple strategies at once.' },
    { icon: <Activity className="w-4 h-4"/>, label: 'Live price data',  desc: 'Real-time via CoinGecko API.' },
    { icon: <Zap     className="w-4 h-4" />, label: 'Instant execution',desc: 'On-chain in seconds.' },
  ];

  return (
    <div className="min-h-screen bg-bg bg-grid flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-bg/90 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-5 h-14 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary
                            flex items-center justify-center shadow-lg shadow-primary/30">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm leading-none">AutoPilot</p>
              <p className="text-[10px] text-muted leading-none">Wallet Agent</p>
            </div>
          </div>
          <WalletButton />
        </div>
      </header>

      <div className="flex-1 px-5 py-8 max-w-2xl mx-auto w-full space-y-10">

        {/* Hero */}
        <div className="text-center space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                          bg-accent/10 border border-accent/20 text-xs font-mono font-bold text-accent mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping-slow" />
            LIVE ON SOLANA DEVNET
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">
            Your{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AI Trading Agent
            </span>
            <br />that never sleeps
          </h1>

          <p className="text-muted text-base leading-relaxed max-w-md mx-auto">
            AutoPilot monitors Solana token prices 24/7 and automatically
            executes trades when your conditions are met — without you lifting a finger.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <WalletButton />
            <span className="text-xs text-muted">No sign-up · Non-custodial · Free to use</span>
          </div>
        </div>

        {/* How it works */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex-1 h-px bg-border" />
            <p className="text-xs font-bold text-muted uppercase tracking-widest px-3">How It Works</p>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-card border border-border
                                      hover:border-primary/30 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-card-2 flex items-center justify-center text-xl">
                    {step.icon}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-primary/60">0{i + 1}</span>
                    <p className="font-bold text-sm">{step.title}</p>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-muted/30 flex-shrink-0 self-center hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Demo flow pill */}
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
          <p className="text-xs font-bold text-primary mb-3 uppercase tracking-wider">⚡ Demo in 60 seconds</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              'Connect wallet',
              'Create agent: "SOL drops 5% → Buy"',
              'Click Trigger Agent',
              'Approve in Phantom',
              'See result in Execution Log',
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold
                                 flex items-center justify-center flex-shrink-0 font-mono text-[10px]">
                  {i + 1}
                </span>
                <span className="text-muted">{s}</span>
                {i < 4 && <ArrowRight className="w-3 h-3 text-muted/40 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-2 gap-3">
          {features.map(f => (
            <div key={f.label} className="p-4 rounded-2xl bg-card border border-border space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                {f.icon}
              </div>
              <p className="font-bold text-sm">{f.label}</p>
              <p className="text-xs text-muted">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Supported tokens */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-muted uppercase tracking-wider text-center">
            Supports these Solana tokens
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['SOL', 'JTO', 'RAY', 'BONK', 'WIF', 'JUP', 'PYTH', 'RENDER', 'HNT', 'ORCA', '+10 more'].map(t => (
              <span key={t} className="px-3 py-1.5 rounded-full bg-card border border-border
                                       text-xs font-mono font-bold text-muted hover:text-text
                                       hover:border-primary/30 transition-colors">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center pb-8 space-y-3">
          <p className="text-sm font-semibold">Ready to automate your trades?</p>
          <WalletButton />
          <p className="text-xs text-muted">
            Running on <span className="text-warning font-semibold">Devnet</span> — test SOL only, no real funds at risk.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Agents section (stable, outside page component) ─────────────────────────
interface AgentsSectionProps {
  agents: AgentRule[]; connected: boolean; processing: boolean;
  onPause: (id: string) => void; onDelete: (id: string) => void;
  onTrigger: (agent: AgentRule) => void; onCreate: () => void;
}

const AgentsSection = memo(function AgentsSection({
  agents, connected, processing, onPause, onDelete, onTrigger, onCreate,
}: AgentsSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-sm">Active Agents</h2>
          {agents.length > 0 && (
            <span className="font-mono text-xs text-muted bg-card-2 px-2 py-0.5 rounded-full border border-border">
              {agents.length}
            </span>
          )}
        </div>
        {connected && (
          <button
            onClick={onCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                       bg-primary/15 text-primary hover:bg-primary/25 transition-all border
                       border-primary/20 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            New Agent
          </button>
        )}
      </div>
      {agents.length === 0 ? (
        <EmptyAgentsState onCreateClick={onCreate} />
      ) : (
        <div className="space-y-3">
          {agents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onPause={onPause}
              onDelete={onDelete}
              onTrigger={onTrigger}
              processing={processing}
            />
          ))}
        </div>
      )}
    </div>
  );
});

// ─── Main dashboard (shown after wallet connects) ─────────────────────────────
export default function DashboardPage() {
  const { connected }                    = useWallet();
  const [activeTab, setActiveTab]        = useState('home');
  const [showCreateModal, setShowCreate] = useState(false);

  const { balance, loading: balLoading, refresh: refreshBalance } = useWalletBalance();
  const { price }  = useSolPrice();
  const {
    agents, executions, processing,
    addAgent, removeAgent, togglePause, triggerNow,
  } = useAgentEngine({
    price:            price ?? { current: 0, change24h: 0, history: [] },
    onBalanceRefresh: refreshBalance,
  });

  const successCount = executions.filter(e => e.status === 'success').length;
  const successRate  = executions.length > 0 ? (successCount / executions.length) * 100 : 100;
  const activeAgents = agents.filter(a => a.status === 'monitoring').length;

  const openCreate  = useCallback(() => setShowCreate(true),  []);
  const closeCreate = useCallback(() => setShowCreate(false), []);

  const handleCreateAgent = useCallback(
    (data: Parameters<typeof addAgent>[0]) => {
      if (!connected) return;
      addAgent(data);
      closeCreate();
    },
    [connected, addAgent, closeCreate],
  );

  const handleTriggerFirst = useCallback(() => {
    const first = agents.find(a => a.status === 'monitoring');
    if (first) triggerNow(first);
  }, [agents, triggerNow]);

  // Show landing page if not connected
  if (!connected) return <LandingPage />;

  return (
    <div className="min-h-screen bg-bg bg-grid">
      <div className="flex min-h-screen">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} agentCount={activeAgents} />

        <main className="flex-1 min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-bg/90 backdrop-blur-xl border-b border-border">
            <div className="flex items-center justify-between px-4 sm:px-6 h-14">
              <div className="flex items-center gap-2.5 lg:hidden">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary
                                flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-sm">AutoPilot</span>
              </div>

              <div className="hidden lg:flex items-center gap-3">
                <h1 className="font-bold capitalize">
                  {activeTab === 'home' ? 'Dashboard' : activeTab}
                </h1>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent/10 border border-accent/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping-slow" />
                  <span className="text-[10px] font-mono font-bold text-accent uppercase">Live</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {connected && (
                  <button
                    onClick={refreshBalance}
                    className={`p-2 rounded-lg hover:bg-card text-muted hover:text-text transition-all
                      ${balLoading ? 'animate-spin' : ''}`}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
                <div className="lg:hidden">
                  <WalletButton />
                </div>
                {agents.length > 0 && (
                  <button
                    onClick={handleTriggerFirst}
                    disabled={processing}
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs
                               font-semibold bg-accent/15 text-accent hover:bg-accent/25
                               disabled:opacity-50 transition-all border border-accent/20 active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Trigger Agent
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-4 sm:p-6 pb-24 lg:pb-8">

            {activeTab === 'home' && (
              <div className="space-y-4 lg:space-y-5">
                <BalanceCard
                  balance={balance}
                  loading={balLoading}
                  refresh={refreshBalance}
                  price={price}
                />
                <StatsBar
                  agentCount={activeAgents}
                  execCount={executions.length}
                  successRate={successRate}
                />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-5">
                  <AgentsSection
                    agents={agents}
                    connected={connected}
                    processing={processing}
                    onPause={togglePause}
                    onDelete={removeAgent}
                    onTrigger={triggerNow}
                    onCreate={openCreate}
                  />
                  <ExecutionLog executions={executions} />
                </div>
              </div>
            )}

            {activeTab === 'agents' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-bold">My Agents</h1>
                  <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                               bg-gradient-to-r from-primary to-secondary text-white
                               hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    New Agent
                  </button>
                </div>
                <AgentsSection
                  agents={agents}
                  connected={connected}
                  processing={processing}
                  onPause={togglePause}
                  onDelete={removeAgent}
                  onTrigger={triggerNow}
                  onCreate={openCreate}
                />
                {executions.length > 0 && <ExecutionLog executions={executions} />}
              </div>
            )}

            {activeTab === 'market' && (
              <div className="space-y-4">
                <h1 className="text-xl font-bold lg:hidden">Market</h1>
                <MarketCard solHistory={price?.history ?? []} />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">
                <h1 className="text-xl font-bold lg:hidden">Settings</h1>
                <SettingsPanel />
              </div>
            )}
          </div>
        </main>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {showCreateModal && (
        <CreateAgentModal onClose={closeCreate} onCreate={handleCreateAgent} />
      )}
    </div>
  );
}
