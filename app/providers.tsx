'use client';
import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { SOLANA_RPC_ENDPOINT } from '@/lib/constants';
import '@solana/wallet-adapter-react-ui/styles.css';

const CP  = ConnectionProvider  as any;
const WP  = WalletProvider      as any;
const WMP = WalletModalProvider as any;

export function SolanaProviders({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], []);

  return (
    <CP endpoint={SOLANA_RPC_ENDPOINT}>
      <WP
        wallets={wallets}
        autoConnect={false}
        onError={(error: Error) => console.warn('Wallet error:', error.message)}
      >
        <WMP>
          {children}
        </WMP>
      </WP>
    </CP>
  );
}
