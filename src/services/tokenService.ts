export interface Token {
  symbol: string;
  name: string;
  icon: string;
  mint: string;
  decimals: number;
  logoURI?: string;
}

// Your custom token that stays even when fetching from API
const CUSTOM_TOKENS: Token[] = [
  { symbol: "$ZYRA", name: "ZYRA", icon: "💲", mint: "3Jz9qH8kB8EyJJu8W1Mj5AS4GX54xJFfcnNNuWZ35bZE", decimals: 9 },
];

export const fetchAllTokens = async (): Promise<Token[]> => {
  try {
    // Fetch from Jupiter's token list
    const response = await fetch("https://token.jup.ag/all");
    const data = await response.json();
    
    // Transform to your format
    const jupiterTokens = data.map((token: any) => ({
      symbol: token.symbol,
      name: token.name,
      icon: token.logoURI || getFallbackIcon(token.symbol),
      mint: token.address,
      decimals: token.decimals,
      logoURI: token.logoURI,
    }));
    
    // Combine with your custom token
    const allTokens = [...CUSTOM_TOKENS, ...jupiterTokens];
    
    // Remove duplicates (keep your custom token)
    const uniqueTokens = allTokens.filter((token, index, self) => 
      index === self.findIndex(t => t.mint === token.mint)
    );
    
    // Sort alphabetically
    uniqueTokens.sort((a, b) => a.symbol.localeCompare(b.symbol));
    
    return uniqueTokens;
  } catch (error) {
    console.error("Failed to fetch tokens:", error);
    return getFallbackTokens();
  }
};

const getFallbackTokens = (): Token[] => {
  return [
    { symbol: "$ZYRA", name: "ZYRA", icon: "💲", mint: "3Jz9qH8kB8EyJJu8W1Mj5AS4GX54xJFfcnNNuWZ35bZE", decimals: 9 },
    { symbol: "SOL", name: "Solana", icon: "◎", mint: "So11111111111111111111111111111111111111112", decimals: 9 },
    { symbol: "USDC", name: "USD Coin", icon: "💲", mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6 },
  ];
};

const getFallbackIcon = (symbol: string): string => {
  const icons: Record<string, string> = {
    'SOL': '◎', 'USDC': '💲', 'USDT': '💵', 'BONK': '🦴',
    'JUP': '🪐', 'RAY': '☀️', 'ORCA': '🐋', 'WIF': '🎩'
  };
  return icons[symbol] || '🪙';
};