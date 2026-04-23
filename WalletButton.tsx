'use client';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { Wallet, ChevronDown, LogOut, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { shortAddress } from '@/lib/solana';

export function WalletButton() {
  const { setVisible }                             = useWalletModal();
  const { connected, publicKey, disconnect }       = useWallet();
  const [copied, setCopied]                        = useState(false);
  const [menuOpen, setMenuOpen]                    = useState(false);

  const address = publicKey?.toBase58() ?? '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!connected) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90
                   text-white font-semibold text-sm transition-all duration-200
                   hover:shadow-lg hover:shadow-primary/30 active:scale-95"
      >
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card-2 border border-border
                   text-sm font-medium hover:border-primary/50 transition-all duration-200"
      >
        {/* green dot */}
        <span className="w-2 h-2 rounded-full bg-accent animate-pulse-slow" />
        <span className="font-mono text-accent">{shortAddress(address)}</span>
        <ChevronDown className={`w-3 h-3 text-muted transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
      </button>

      {menuOpen && (
        <div
          className="absolute right-0 top-12 z-50 w-52 rounded-xl bg-card border border-border
                     shadow-2xl shadow-black/50 animate-slide-up overflow-hidden"
        >
          <div className="p-3 border-b border-border">
            <p className="text-xs text-muted mb-1">Connected wallet</p>
            <p className="font-mono text-xs text-text truncate">{address}</p>
          </div>
          <button
            onClick={() => { handleCopy(); setMenuOpen(false); }}
            className="flex items-center gap-2 w-full px-3 py-2.5 text-sm hover:bg-card-2 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4 text-muted" />}
            {copied ? 'Copied!' : 'Copy address'}
          </button>
          <button
            onClick={() => { disconnect(); setMenuOpen(false); }}
            className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-danger hover:bg-card-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Disconnect
          </button>
        </div>
      )}

      {/* click-outside overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
      )}
    </div>
  );
}
