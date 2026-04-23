import type { Metadata } from 'next';
import './globals.css';
import { SolanaProviders } from './providers';

export const metadata: Metadata = {
  title:       'AutoPilot Wallet Agent',
  description: 'AI-powered Solana wallet automation',
  viewport:    'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg text-text antialiased">
        <SolanaProviders>
          {children}
        </SolanaProviders>
      </body>
    </html>
  );
}
