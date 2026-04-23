export const SOLANA_RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com';

export const EXPLORER_BASE    = 'https://explorer.solana.com/tx';
export const EXPLORER_CLUSTER = '?cluster=devnet';

// Popular Solana ecosystem tokens (CoinGecko IDs)
export const SOLANA_TOKENS = [
  { id: 'solana',                  symbol: 'SOL',    name: 'Solana'        },
  { id: 'jito-governance-token',   symbol: 'JTO',    name: 'Jito'          },
  { id: 'raydium',                 symbol: 'RAY',    name: 'Raydium'       },
  { id: 'bonk',                    symbol: 'BONK',   name: 'Bonk'          },
  { id: 'dogwifcoin',              symbol: 'WIF',    name: 'dogwifhat'     },
  { id: 'jupiter-exchange-solana', symbol: 'JUP',    name: 'Jupiter'       },
  { id: 'pyth-network',            symbol: 'PYTH',   name: 'Pyth Network'  },
  { id: 'render-token',            symbol: 'RENDER', name: 'Render'        },
  { id: 'helium',                  symbol: 'HNT',    name: 'Helium'        },
  { id: 'orca-so',                 symbol: 'ORCA',   name: 'Orca'          },
  { id: 'marinade',                symbol: 'MNDE',   name: 'Marinade'      },
  { id: 'drift-protocol',          symbol: 'DRIFT',  name: 'Drift'         },
  { id: 'kamino',                  symbol: 'KMNO',   name: 'Kamino'        },
  { id: 'tensor',                  symbol: 'TNSR',   name: 'Tensor'        },
  { id: 'popcat',                  symbol: 'POPCAT', name: 'Popcat'        },
  { id: 'cat-in-a-dogs-world',     symbol: 'MEW',    name: 'MEW'           },
  { id: 'stepn',                   symbol: 'GMT',    name: 'STEPN'         },
  { id: 'nosana',                  symbol: 'NOS',    name: 'Nosana'        },
  { id: 'parcl',                   symbol: 'PRCL',   name: 'Parcl'         },
  { id: 'myro',                    symbol: 'MYRO',   name: 'Myro'          },
];
