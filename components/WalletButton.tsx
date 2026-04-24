'use client';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  Wallet, ChevronDown, LogOut,
  Copy, Check, RefreshCw, ExternalLink,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { shortAddress } from '@/lib/solana';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isMobile(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isInsidePhantom(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as any).phantom?.solana?.isPhantom;
}

function isInsideSolflare(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as any).solflare?.isSolflare;
}

function isInAnyWalletBrowser(): boolean {
  return isInsidePhantom() || isInsideSolflare();
}

function getDeepLinks() {
  const url = typeof window !== 'undefined'
    ? window.location.href
    : '';
  const encoded = encodeURIComponent(url);
  return {
    phantom:  `https://phantom.app/ul/browse/${encoded}?ref=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`,
    solflare: `https://solflare.com/ul/v1/browse/${encoded}?ref=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`,
  };
}

// ─── Mobile deep-link picker ──────────────────────────────────────────────────

function MobileWalletPicker({ onClose }: { onClose: () => void }) {
  const links = getDeepLinks();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-card border border-border
                      rounded-t-2xl shadow-2xl pb-8">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-4">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="px-5 space-y-4">
          <div>
            <h2 className="font-bold text-base">Connect Wallet</h2>
            <p className="text-xs text-muted mt-1">
              Open AutoPilot inside your wallet app to connect
            </p>
          </div>

          {/* Phantom */}
          <a
            href={links.phantom}
            className="flex items-center gap-3 p-4 rounded-xl bg-card-2 border border-border
                       hover:border-primary/40 transition-colors active:scale-[0.98] block"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#4B3FDE] flex items-center
                            justify-center text-2xl flex-shrink-0">
              👻
            </div>
            <div className="flex-1">
              <p className="font-bold">Phantom</p>
              <p className="text-xs text-muted">Tap to open in Phantom</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted" />
          </a>

          {/* Solflare */}
          <a
            href={links.solflare}
            className="flex items-center gap-3 p-4 rounded-xl bg-card-2 border border-border
                       hover:border-primary/40 transition-colors active:scale-[0.98] block"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FC8D0E] flex items-center
                            justify-center text-2xl flex-shrink-0">
              🌟
            </div>
            <div className="flex-1">
              <p className="font-bold">Solflare</p>
              <p className="text-xs text-muted">Tap to open in Solflare</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted" />
          </a>

          {/* Steps */}
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-xs font-bold text-primary mb-2">How it works:</p>
            <div className="space-y-1.5 text-xs text-muted">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-primary/20 text-primary font-bold
                                 flex items-center justify-center flex-shrink-0 text-[10px]">1</span>
                <span>Tap Phantom or Solflare above</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-primary/20 text-primary font-bold
                                 flex items-center justify-center flex-shrink-0 text-[10px]">2</span>
                <span>AutoPilot opens inside the wallet app</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-primary/20 text-primary font-bold
                                 flex items-center justify-center flex-shrink-0 text-[10px]">3</span>
                <span>Tap Connect — it works instantly</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm text-muted
                       hover:bg-card-2 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── In-wallet connect button (shown when inside Phantom/Solflare browser) ────

function InWalletConnectButton() {
  const { select, wallets, connect, connecting } = useWallet();
  const [tried, setTried] = useState(false);

  const handleConnect = useCallback(async () => {
    try {
      setTried(true);
      // Find the right wallet adapter
      const phantom  = wallets.find(w => w.adapter.name === 'Phantom');
      const solflare = wallets.find(w => w.adapter.name === 'Solflare');
      const target   = isInsidePhantom() ? phantom : isInsideSolflare() ? solflare : phantom;

      if (target) {
        select(target.adapter.name);
        // Small delay to let select settle
        await new Promise(r => setTimeout(r, 100));
        await connect();
      }
    } catch (err) {
      console.warn('Connect error:', err);
    }
  }, [wallets, select, connect]);

  if (connecting) {
    return (
      <button disabled className="flex items-center gap-2 px-4 py-2 rounded-lg
                                   bg-primary/50 text-white font-semibold text-sm">
        <RefreshCw className="w-4 h-4 animate-spin" />
        Connecting...
      </button>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="flex items-center gap-2 px-4 py-2 rounded-lg
                 bg-gradient-to-r from-primary to-secondary text-white
                 font-semibold text-sm transition-all hover:opacity-90
                 hover:shadow-lg hover:shadow-primary/30 active:scale-95"
    >
      <Wallet className="w-4 h-4" />
      {tried ? 'Retry Connect' : 'Connect Wallet'}
    </button>
  );
}

// ─── Main WalletButton ────────────────────────────────────────────────────────

export function WalletButton() {
  const { setVisible }                                            = useWalletModal();
  const { connected, connecting, publicKey, disconnect, wallet } = useWallet();
  const [copied,     setCopied]     = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [inWallet,   setInWallet]   = useState(false);
  const [mobile,     setMobile]     = useState(false);

  const address = publicKey?.toBase58() ?? '';

  useEffect(() => {
    setInWallet(isInAnyWalletBrowser());
    setMobile(isMobile());
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
    try { await disconnect(); } catch { /* ignore */ }
  };

  const handleConnectClick = () => {
    if (mobile && !inWallet) {
      // On mobile outside wallet browser → show deep link picker
      setShowPicker(true);
    } else {
      // Desktop or inside wallet browser → standard modal
      setVisible(true);
    }
  };

  // ── Connecting state ──
  if (connecting) {
    return (
      <button disabled className="flex items-center gap-2 px-4 py-2 rounded-lg
                                   bg-primary/50 text-white font-semibold text-sm">
        <RefreshCw className="w-4 h-4 animate-spin" />
        Connecting...
      </button>
    );
  }

  // ── Not connected ──
  if (!connected) {
    // Inside Phantom or Solflare browser — use direct connect
    if (inWallet) {
      return <InWalletConnectButton />;
    }

    return (
      <>
        <button
          onClick={handleConnectClick}
          className="flex items-center gap-2 px-4 py-2 rounded-lg
                     bg-gradient-to-r from-primary to-secondary text-white
                     font-semibold text-sm transition-all hover:opacity-90
                     hover:shadow-lg hover:shadow-primary/30 active:scale-95"
        >
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </button>
        {showPicker && (
          <MobileWalletPicker onClose={() => setShowPicker(false)} />
        )}
      </>
    );
  }

  // ── Connected ──
  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card-2
                   border border-border text-sm font-medium
                   hover:border-primary/50 transition-all"
      >
        {wallet?.adapter?.icon && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={wallet.adapter.icon}
            alt=""
            className="w-4 h-4 rounded-full"
          />
        )}
        <span className="w-2 h-2 rounded-full bg-accent animate-pulse-slow" />
        <span className="font-mono text-accent text-xs">
          {shortAddress(address)}
        </span>
        <ChevronDown className={`w-3 h-3 text-muted transition-transform
          ${menuOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {menuOpen && (
        <div className="absolute right-0 top-12 z-50 w-56 rounded-xl bg-card
                        border border-border shadow-2xl overflow-hidden animate-slide-up">
          {/* Address */}
          <div className="p-3 border-b border-border bg-card-2/50">
            <div className="flex items-center gap-2 mb-1">
              {wallet?.adapter?.icon && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={wallet.adapter.icon} alt="" className="w-4 h-4 rounded-full" />
              )}
              <p className="text-xs font-semibold text-muted">
                {wallet?.adapter?.name ?? 'Wallet'}
              </p>
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
            {copied ? 'Copied!' : 'Copy address'}
          </button>

          <button
            onClick={() => { setMenuOpen(false); setVisible(true); }}
            className="flex items-center gap-2.5 w-full px-4 py-3 text-sm
                       hover:bg-card-2 transition-colors text-left"
          >
            <Wallet className="w-4 h-4 text-muted" />
            Change wallet
          </button>

          <div className="border-t border-border" />

          <button
            onClick={handleDisconnect}
            className="flex items-center gap-2.5 w-full px-4 py-3 text-sm
                       text-danger hover:bg-danger/10 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            Disconnect
          </button>
        </div>
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
      )}
    </div>
  );
    }
