'use client';

import { useState, useCallback } from 'react';
import { Plus, Zap, Bot, RefreshCw } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';

// Components
import { Sidebar }           from '@/components/Sidebar';
import { BottomNav }         from '@/components/BottomNav';
import { WalletButton }      from '@/components/WalletButton';
import { BalanceCard }       from '@/components/BalanceCard';
import { AgentCard }         from '@/components/AgentCard';
import { CreateAgentModal }  from '@/components/CreateAgentModal';
import { ExecutionLog }      from '@/components/ExecutionLog';
import { MarketCard }        from '@/components/MarketCard';
import { SettingsPanel }     from '@/components/SettingsPanel';
import { StatsBar }          from '@/components/StatsBar';
import { EmptyAgentsState }  from '@/components/EmptyAgentsState';

// Hooks
import { useWalletBalance }  from '@/hooks/useWalletBalance';
import { useSolPrice }       from '@/hooks/useSolPrice';
import { useAgentEngine }    from '@/hooks/useAgentEngine';

// Types
import { Condition, Action } from '@/lib/types';

// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { connected }                      = useWallet();
  const [activeTab, setActiveTab]          = useState('home');
  const [showCreateModal, setShowCreate]   = useState(false);

  // Data
  const { balance, loading: balLoading, refresh: refreshBalance } = useWalletBalance();
  const { price }                                                  = useSolPrice();
  const {
    agents, executions, processing,
    addAgent, removeAgent, togglePause, triggerNow,
  } = useAgentEngine({ price, onBalanceRefresh: refreshBalance });

  // Stats
  const successCount  = executions.filter(e => e.status === 'success').length;
  const successRate   = executions.length > 0 ? (successCount / executions.length) * 100 : 100;
  const activeAgents  = agents.filter(a => a.status === 'monitoring').length;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleCreateAgent = useCallback(
    (data: { name: string; condition: Condition; action: Action; amount: number }) => {
      if (!connected) return;
      addAgent(data);
    },
    [connected, addAgent],
  );

  // ── Render helpers ───────────────────────────────────────────────────────────
  const HomeTab = () => (
    <div className="space-y-4 lg:space-y-5">
      {/* Balance */}
      <BalanceCard
        balance={balance}
        loading={balLoading}
        refresh={refreshBalance}
        price={price}
      />

      {/* Stats pills */}
      <StatsBar
        agentCount={activeAgents}
        execCount={executions.length}
        successRate={successRate}
      />

      {/* Desktop 2-col: agents + log */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-5">
        <AgentsSection />
        <ExecutionLog executions={executions} />
      </div>
    </div>
  );

  const AgentsSection = () => (
    <div className="space-y-3">
      {/* Section header */}
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
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                       bg-primary/15 text-primary hover:bg-primary/25 transition-all border
                       border-primary/20 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            New Agent
          </button>
        )}
      </div>

      {/* Agent list or empty state */}
      {!connected ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50
                        flex flex-col items-center justify-center py-10 px-6 text-center">
          <p className="text-sm text-muted mb-3">Connect your wallet to deploy agents</p>
          <WalletButton />
        </div>
      ) : agents.length === 0 ? (
        <EmptyAgentsState onCreateClick={() => setShowCreate(true)} />
      ) : (
        <div className="space-y-3">
          {agents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onPause={togglePause}
              onDelete={removeAgent}
              onTrigger={triggerNow}
              processing={processing}
            />
          ))}
        </div>
      )}
    </div>
  );

  const AgentsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">My Agents</h1>
        {connected && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                       bg-gradient-to-r from-primary to-secondary text-white
                       hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Agent
          </button>
        )}
      </div>
      <AgentsSection />
      {executions.length > 0 && (
        <ExecutionLog executions={executions} />
      )}
    </div>
  );

  // ── Main render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-bg bg-grid">
      {/* Desktop layout */}
      <div className="flex min-h-screen">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          agentCount={activeAgents}
        />

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-30 bg-bg/90 backdrop-blur-xl border-b border-border">
            <div className="flex items-center justify-between px-4 sm:px-6 h-14">
              {/* Logo (mobile only) */}
              <div className="flex items-center gap-2.5 lg:hidden">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary
                                flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-sm">AutoPilot</span>
              </div>

              {/* Page title (desktop) */}
              <div className="hidden lg:flex items-center gap-3">
                <h1 className="font-bold capitalize">
                  {activeTab === 'home' ? 'Dashboard' : activeTab}
                </h1>
                {/* Live dot */}
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent/10 border border-accent/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping-slow" />
                  <span className="text-[10px] font-mono font-bold text-accent uppercase">Live</span>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-2">
                {/* Refresh balance */}
                {connected && (
                  <button
                    onClick={refreshBalance}
                    className={`p-2 rounded-lg hover:bg-card text-muted hover:text-text transition-all
                      ${balLoading ? 'animate-spin' : ''}`}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
                {/* Wallet (shown in header on mobile/tablet) */}
                <div className="lg:hidden">
                  <WalletButton />
                </div>
                {/* Demo trigger button */}
                {connected && agents.length > 0 && (
                  <button
                    onClick={() => {
                      const first = agents.find(a => a.status === 'monitoring');
                      if (first) triggerNow(first);
                    }}
                    disabled={processing}
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold
                               bg-accent/15 text-accent hover:bg-accent/25 disabled:opacity-50
                               transition-all border border-accent/20 active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Trigger Agent
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Page content */}
          <div className="p-4 sm:p-6 pb-24 lg:pb-8">
            {/* Demo banner — wallet not connected */}
            {!connected && (
              <div className="mb-5 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3
                              animate-fade-in">
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">Welcome to AutoPilot Wallet</p>
                  <p className="text-xs text-muted mt-0.5">
                    Connect your Phantom wallet to start deploying automated trading agents on Solana.
                  </p>
                </div>
                <WalletButton />
              </div>
            )}

            {/* Tab content */}
            {activeTab === 'home'     && <HomeTab />}
            {activeTab === 'agents'   && <AgentsTab />}
            {activeTab === 'market'   && (
              <div className="space-y-4">
                <h1 className="text-xl font-bold lg:hidden">Market</h1>
                <MarketCard />
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

      {/* Mobile bottom nav */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Create agent modal */}
      {showCreateModal && (
        <CreateAgentModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreateAgent}
        />
      )}
    </div>
  );
}
