'use client';
import { Shield, Globe, Info, ExternalLink } from 'lucide-react';
import { SOLANA_RPC_ENDPOINT } from '@/lib/constants';

export function SettingsPanel() {
  const network = SOLANA_RPC_ENDPOINT.includes('devnet')
    ? 'Devnet'
    : SOLANA_RPC_ENDPOINT.includes('mainnet')
      ? 'Mainnet'
      : 'Custom';

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-sm">Network</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted" />
              <span className="text-sm text-muted">Cluster</span>
            </div>
            <span className={`font-mono text-sm font-bold px-2 py-0.5 rounded-full
              ${network === 'Mainnet' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>
              {network}
            </span>
          </div>
          <div className="bg-card-2 rounded-lg p-3">
            <p className="text-xs text-muted mb-1">RPC Endpoint</p>
            <p className="font-mono text-xs text-text break-all">{SOLANA_RPC_ENDPOINT}</p>
          </div>
          <div className="flex items-start gap-2 bg-warning/5 border border-warning/20 rounded-lg p-3">
            <Info className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted">
              Running on <span className="text-warning font-semibold">Devnet</span>.
              Transactions use test SOL and do not affect real funds.
              Switch to mainnet by updating <code className="font-mono text-text">NEXT_PUBLIC_SOLANA_RPC_ENDPOINT</code> in your <code className="font-mono text-text">.env</code>.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Info className="w-4 h-4 text-secondary" />
          <h2 className="font-bold text-sm">About</h2>
        </div>
        <div className="p-5 space-y-3">
          {[
            { label: 'App',      value: 'AutoPilot Wallet Agent' },
            { label: 'Version',  value: '0.1.0 MVP' },
            { label: 'Network',  value: 'Solana (Devnet)' },
            { label: 'Stack',    value: 'Next.js · Tailwind · web3.js' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <span className="text-muted">{label}</span>
              <span className="font-mono text-xs text-text">{value}</span>
            </div>
          ))}

          <div className="pt-2 border-t border-border">
            <a
              href="https://explorer.solana.com/?cluster=devnet"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-secondary hover:text-secondary/80 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Solana Devnet Explorer
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
