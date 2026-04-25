'use client';
import { Home, Bot, BarChart2, Settings, Zap, Activity } from 'lucide-react';
import { WalletButton } from './WalletButton';

interface Props {
  activeTab:   string;
  onTabChange: (tab: string) => void;
  agentCount:  number;
}

const NAV_ITEMS = [
  { id: 'home',     label: 'Dashboard', Icon: Home      },
  { id: 'agents',   label: 'Agents',    Icon: Bot       },
  { id: 'market',   label: 'Market',    Icon: BarChart2 },
  { id: 'settings', label: 'Settings',  Icon: Settings  },
] as const;

export function Sidebar({ activeTab, onTabChange, agentCount }: Props) {
  return (
    <aside className="hidden lg:flex flex-col w-60 xl:w-64 h-screen sticky top-0
                      border-r border-border bg-card/60 backdrop-blur-xl flex-shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary
                          flex items-center justify-center shadow-lg shadow-primary/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">HELM</p>
            <p className="text-xs text-muted leading-tight">Intent Execution</p>
          </div>
        </div>
      </div>

      {/* Status indicator */}
      <div className="px-4 py-3 mx-3 mt-3 rounded-xl bg-card-2 border border-border">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs text-muted">Engine</span>
          <span className="ml-auto text-xs font-mono font-bold text-accent">LIVE</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-xs text-muted">Active agents</span>
          <span className="ml-auto font-mono text-xs font-bold text-text">
            {agentCount}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
                          text-sm font-medium transition-all duration-150 text-left
                ${active
                  ? 'bg-primary/15 text-primary border border-primary/20'
                  : 'text-muted hover:text-text hover:bg-card-2'
                }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
              {id === 'agents' && agentCount > 0 && (
                <span className="ml-auto text-xs font-mono bg-primary/20
                                 text-primary px-1.5 py-0.5 rounded-full">
                  {agentCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Wallet at bottom */}
      <div className="p-4 border-t border-border">
        <WalletButton />
      </div>
    </aside>
  );
}
