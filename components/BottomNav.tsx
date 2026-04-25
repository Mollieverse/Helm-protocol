'use client';
import { Home, Bot, BarChart2, Settings } from 'lucide-react';

interface Props {
  activeTab:   string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'home',     label: 'Home',     Icon: Home      },
  { id: 'agents',   label: 'Agents',   Icon: Bot       },
  { id: 'market',   label: 'Market',   Icon: BarChart2 },
  { id: 'settings', label: 'Settings', Icon: Settings  },
] as const;

export function BottomNav({ activeTab, onTabChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden
                    bg-card/95 backdrop-blur-xl border-t border-border">
      <div className="flex items-center">
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3
                          transition-all duration-200
                ${active ? 'text-primary' : 'text-muted hover:text-text'}`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2
                                   w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className={`text-[10px] font-semibold tracking-wide uppercase
                ${active ? 'text-primary' : 'text-muted'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
