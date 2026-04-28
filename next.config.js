/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs:     false,
      net:    false,
      tls:    false,
      crypto: false,
    };
    return config;
  },
  images: {
    remotePatterns: [
      // Jupiter CDN — covers ALL Solana tokens including meme coins
      {
        protocol: 'https',
        hostname: 'img.jup.ag',
      },
      // Arweave — used by many Solana NFT and token projects
      {
        protocol: 'https',
        hostname: 'arweave.net',
      },
      // IPFS via nftstorage
      {
        protocol: 'https',
        hostname: '*.ipfs.nftstorage.link',
      },
      // GitHub raw — fallback
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      // Cloudflare IPFS
      {
        protocol: 'https',
        hostname: 'cloudflare-ipfs.com',
      },
      // Generic IPFS gateways
      {
        protocol: 'https',
        hostname: '*.ipfs.dweb.link',
      },
    ],
  },
};

module.exports = nextConfig;
