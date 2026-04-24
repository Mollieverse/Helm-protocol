'use client';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { Wallet, ChevronDown, LogOut, Copy, Check, RefreshCw, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { shortAddress } from '@/lib/solana';

// ─── Detect mobile ────────────────────────────────────────────────────────────
function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
    .test(navigator.userAgent);
}

// ─── Detect if running inside a wallet's built-in browser ────────────────────
function isInWalletBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(
    (window as any).solana ||
    (window as any).solflare ||
    (window as any).phantom
  );
}

// ─── Deep links to open dApp inside wallet browser ───────────────────────────
function getDeepLinks(): { phantom: string; solflare: string } {
  const url = typeof window !== 'undefined'
    ? encodeURIComponent(window.location.href)
    : '';
  const ref = typeof window !== 'undefined'
    ? encodeURIComponent(window.location.origin)
    : '';
  return {
    phantom:  `https://phantom.app/ul/browse/${url}?ref=${ref}`,
    solflare: `https://solflare.com/ul/v1/browse/${url}?ref=${ref}`,
  };
}

// ─── Mobile wallet picker modal ───────────────────────────────────────────────
function MobileWalletPicker({ onClose }: { onClose: () => void }) {
  const links = getDeepLinks();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-card border border-border
                      rounded-t-2xl shadow-2xl overflow-hidden">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="p-5">
          <h2 className="font-bold text-base mb-1">Connect Wallet</h2>
          <p className="text-xs text-muted mb-5">
            Open this app inside your wallet's browser to connect.
          </p>

          {/* Phantom */}
          <a
            href={links.phantom}
            className="flex items-center gap-3 p-4 rounded-xl bg-card-2 border border-border
                       hover:border-primary/40 transition-colors mb-3 active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#4B3FDE] flex items-center justify-center flex-shrink-0">
              <span className="text-xl">👻</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">Phantom</p>
              <p className="text-xs text-muted">Open in Phantom browser</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted" />
          </a>

          {/* Solflare */}
          <a
            href={links.solflare}
            className="flex items-center gap-3 p-4 rounded-xl bg-card-2 border border-border
                       hover:border-primary/40 transition-colors mb-5 active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FC8D0E] flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🌟</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">Solflare</p>
              <p className="text-xs text-muted">Open in Solflare browser</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted" />
          </a>

          {/* Info box */}
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted">
            <p className="font-semibold text-primary mb-1">How to connect on mobile:</p>
            <ol className="space-y-1 list-decimal list-inside">
              <li>Tap one of the options above</li>
              <li>It opens AutoPilot inside your wallet app</li>
              <li>Tap "Connect" — your wallet connects instantly</li>
            </ol>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-3 py-2.5 rounded-xl text-sm text-muted
                       hover:text-text hover:bg-card-2 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main WalletButton ────────────────────────────────────────────────────────
export function WalletButton() {
  const { setVisible }                                            = useWalletModal();
  const { connected, connecting, publicKey, disconnect, wallet } = useWallet();
  const [copied,       setCopied]       = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [showMobile,   setShowMobile]   = useState(false);
  const [inWallet,     setInWallet]     = useState(false);

  const address = publicKey?.toBase58() ?? '';

  useEffect(() => {
    setInWallet(isInWalletBrowser());
  }, []);

  useEffect(() => {
    if (!connected) setMenuOpen(false);
  }, [connected]);

  const handleCopy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDisconnect = async () => {
    setMenuOpen(false);
    await disconnect();
  };

  const handleConnectClick = () => {
    // If on mobile and NOT inside a wallet browser → show deep link picker
    if (isMobile() && !inWallet) {
      setShowMobile(true);
      return;
    }
    // Desktop or already inside wallet browser → normal modal
    setVisible(true);
  };

  // Connecting spinner
  if (connecting) {
    return (
      <button disabled className="flex items-center gap-2 px-4 py-2 rounded-lg
                                   bg-primary/50 text-white font-semibold text-sm cursor-not-allowed">
        <RefreshCw className="w-4 h-4 animate-spin" />
        Connecting...
      </button>
    );
  }

  // Not connected
  if (!connected) {
    return (
      <>
        <button
          onClick={handleConnectClick}
          className="flex items-center gap-2 px-4 py-2 rounded-lg
                     bg-gradient-to-r from-primary to-secondary text-white
                     font-semibold text-sm transition-all duration-200
                     hover:opacity-90 hover:shadow-lg hover:shadow-primary/30
                     active:scale-95"
        >
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </button>

        {showMobile && (
          <MobileWalletPicker onClose={() => setShowMobile(false)} />
        )}
      </>
    );
  }

  // Connected
  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card-2 border border-border
                   text-sm font-medium hover:border-primary/50 transition-all duration-200"
      >
        {wallet?.adapter?.icon && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={wallet.adapter.icon} alt="" className="w-4 h-4 rounded-full" />
        )}
        <span className="w-2 h-2 rounded-full bg-accent animate-pulse-slow" />
        <span className="font-mono text-accent text-xs">{shortAddress(address)}</span>
        <ChevronDown className={`w-3 h-3 text-muted transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-12 z-50 w-56 rounded-xl bg-card border border-border
                        shadow-2xl shadow-black/50 overflow-hidden animate-slide-up">
          <div className="p-3 border-b border-border bg-card-2/50">
            <div className="flex items-center gap-2 mb-1">
              {wallet?.adapter?.icon && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={wallet.adapter.icon} alt="" className="w-4 h-4 rounded-full" />
              )}
              <p className="text-xs font-semibold text-muted">{wallet?.adapter?.name ?? 'Wallet'}</p>
            </div>
            <p className="font-mono text-xs text-text truncate">{address}</p>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2.5 w-full px-4 py-3 text-sm
                       hover:bg-card-2 transition-colors text-left"
          >
            {copied
              ? <Check className="w-4 h-4 text-accent" />
              : <Copy  className="w-4 h-4 text-muted"  />}
            <span>{copied ? 'Copied!' : 'Copy address'}</span>
          </button>

          <button
            onClick={() => { setMenuOpen(false); handleConnectClick(); }}
            className="flex items-center gap-2.5 w-full px-4 py-3 text-sm
                       hover:bg-card-2 transition-colors text-left"
          >
            <Wallet className="w-4 h-4 text-muted" />
            <span>Change wallet</span>
          </button>

          <div className="border-t border-border" />

          <button
            onClick={handleDisconnect}
            className="flex items-center gap-2.5 w-full px-4 py-3 text-sm
                       text-danger hover:bg-danger/10 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Disconnect</span>
          </button>
        </div>
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
      )}
    </div>
  );
}
