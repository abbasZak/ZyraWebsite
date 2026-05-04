import { useState, useEffect } from "react";
import { Plus, Loader2, AlertTriangle, Info, Wallet, LogIn, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import DexLayout from "@/components/dex/DexLayout";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

interface Token {
  symbol: string;
  name: string;
  icon: string;
  mint: string;
  decimals: number;
  logoURI?: string;
  price?: number;
}

// Your custom token that stays in the list
const CUSTOM_TOKENS: Token[] = [
  { symbol: "ZRA", name: "Zyra Token", icon: "💎", mint: "3Jz9qH8kB8EyJJu8W1Mj5AS4GX54xJFfcnNNuWZ35bZE", decimals: 9 },
];

// Fallback tokens in case API fails
const FALLBACK_TOKENS: Token[] = [
  { symbol: "SOL", name: "Solana", icon: "◎", mint: "So11111111111111111111111111111111111111112", decimals: 9 },
  { symbol: "USDC", name: "USD Coin", icon: "💲", mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6 },
  { symbol: "USDT", name: "Tether", icon: "💵", mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", decimals: 6 },
];

const getFallbackIcon = (symbol: string): string => {
  const icons: Record<string, string> = {
    'SOL': '◎', 'USDC': '💲', 'USDT': '💵', 'ZRA': '💎',
    'BONK': '🦴', 'JUP': '🪐', 'RAY': '☀️', 'ORCA': '🐋', 'WIF': '🎩'
  };
  return icons[symbol] || '🪙';
};

const AddLiquidity = () => {
  const [tokens, setTokens] = useState<Token[]>(FALLBACK_TOKENS);
  const [isLoadingTokens, setIsLoadingTokens] = useState(true);
  const [tokenA, setTokenA] = useState<Token | null>(null);
  const [tokenB, setTokenB] = useState<Token | null>(null);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const [priceWarning, setPriceWarning] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({
    SOL: 180, USDC: 1, USDT: 1, ZRA: 0.045
  });
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [showTokenSelect, setShowTokenSelect] = useState<"A" | "B" | null>(null);
  const [tokenSearchQuery, setTokenSearchQuery] = useState("");

  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setVisible } = useWalletModal();

  const handleWalletConnect = () => {
    setVisible(true);
  };

  // Fetch tokens from Jupiter API
  useEffect(() => {
  const fetchTokens = async () => {
    setIsLoadingTokens(true);
    try {
      const response = await fetch("https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json");
      if (response.ok) {
        const data = await response.json();
        
        // Transform tokens to your format
        const jupiterTokens: Token[] = data.tokens.map((token: any) => ({
          symbol: token.symbol,
          name: token.name,
          mint: token.address,
          decimals: token.decimals,
          icon: token.logoURI || getFallbackIcon(token.symbol),
          logoURI: token.logoURI,
        }));
        
        // Get custom token first
        const customTokens: Token[] = [...CUSTOM_TOKENS];
        
        // Filter for significant tokens (including ZRA from custom list)
        const significantSymbols = ["SOL", "USDC", "USDT", "BONK", "JUP", "RAY", "ORCA", "WIF", "PYTH", "RENDER"];
        const filteredTokens = jupiterTokens.filter(t => 
          significantSymbols.includes(t.symbol)
        );
        
        // Combine custom tokens with filtered tokens (custom tokens first to ensure they appear)
        const allTokens = [...customTokens, ...filteredTokens];
        
        // Remove duplicates (if by chance ZRA exists in both)
        const uniqueTokens = allTokens.filter((token, index, self) => 
          index === self.findIndex(t => t.mint === token.mint)
        );
        
        // Sort alphabetically
        uniqueTokens.sort((a, b) => a.symbol.localeCompare(b.symbol));
        
        setTokens(uniqueTokens);
        
        // Set default tokens - try to find ZRA first, then SOL, then USDC
        const zraToken = uniqueTokens.find(t => t.symbol === "ZRA");
        const solToken = uniqueTokens.find(t => t.symbol === "SOL");
        const usdcToken = uniqueTokens.find(t => t.symbol === "USDC");
        
        if (zraToken) setTokenA(zraToken);
        if (solToken) setTokenB(solToken);
        else if (usdcToken) setTokenB(usdcToken);
        
        console.log(`Loaded ${uniqueTokens.length} tokens`);
        console.log("ZRA token found:", !!zraToken);
      } else {
        throw new Error("Failed to fetch tokens");
      }
    } catch (error) {
      console.error("Failed to fetch tokens:", error);
      setTokens(FALLBACK_TOKENS);
      setTokenA(FALLBACK_TOKENS[0]);
      setTokenB(FALLBACK_TOKENS[1]);
      toast({
        title: "Using Fallback Tokens",
        description: "Could not fetch latest token list. Using local list.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTokens(false);
    }
  };
  
  fetchTokens();
}, [toast]);

  // Check wallet connection
  useEffect(() => {
    const checkWallet = () => {
      const solana = (window as any).solana;
      setWalletConnected(solana?.isConnected === true || solana?.publicKey !== null);
    };
    checkWallet();
    const interval = setInterval(checkWallet, 2000);
    return () => clearInterval(interval);
  }, []);

  // Fetch token prices from CoinGecko
  useEffect(() => {
    const fetchPrices = async () => {
      setIsLoadingPrices(true);
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana,usd-coin,tether&vs_currencies=usd'
        );
        if (response.ok) {
          const data = await response.json();
          setTokenPrices(prev => ({
            ...prev,
            SOL: data.solana?.usd || prev.SOL,
            USDC: data['usd-coin']?.usd || 1,
            USDT: data.tether?.usd || 1,
            ZRA: prev.ZRA || 0.045,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch prices:", error);
      } finally {
        setIsLoadingPrices(false);
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const getTokenPrice = (symbol: string) => tokenPrices[symbol] || 0;

  // Calculate amount B based on amount A (maintaining ratio)
  const handleAmountAChange = (value: string) => {
    setAmountA(value);
    if (tokenA && tokenB && value && parseFloat(value) > 0) {
      const priceA = getTokenPrice(tokenA.symbol);
      const priceB = getTokenPrice(tokenB.symbol);
      if (priceA > 0 && priceB > 0) {
        const calculatedB = (parseFloat(value) * priceA) / priceB;
        const decimals = tokenB.decimals;
        const formattedB = calculatedB.toFixed(decimals <= 6 ? 6 : 4);
        setAmountB(formattedB);
        
        // Check for price impact warning (> $10,000)
        const totalValue = parseFloat(value) * priceA;
        setPriceWarning(totalValue > 10000);
      }
    } else {
      setAmountB("");
      setPriceWarning(false);
    }
  };

  const handleAmountBChange = (value: string) => {
    setAmountB(value);
    if (tokenA && tokenB && value && parseFloat(value) > 0) {
      const priceA = getTokenPrice(tokenA.symbol);
      const priceB = getTokenPrice(tokenB.symbol);
      if (priceA > 0 && priceB > 0) {
        const calculatedA = (parseFloat(value) * priceB) / priceA;
        const decimals = tokenA.decimals;
        const formattedA = calculatedA.toFixed(decimals <= 6 ? 6 : 4);
        setAmountA(formattedA);
        
        const totalValue = parseFloat(formattedA) * priceA;
        setPriceWarning(totalValue > 10000);
      }
    } else {
      setAmountA("");
      setPriceWarning(false);
    }
  };

  const addLiquidity = async () => {
    const solana = (window as any).solana;
    
    if (!walletConnected || !solana || !solana.publicKey) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!amountA || parseFloat(amountA) <= 0 || !amountB || parseFloat(amountB) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter valid amounts for both tokens",
        variant: "destructive",
      });
      return;
    }

    // Safety check: Minimum liquidity
    const minValue = 10; // Minimum $10 worth of liquidity
    const valueA = parseFloat(amountA) * getTokenPrice(tokenA!.symbol);
    const valueB = parseFloat(amountB) * getTokenPrice(tokenB!.symbol);
    
    if (valueA < minValue || valueB < minValue) {
      toast({
        title: "Minimum Liquidity Required",
        description: `Please add at least $${minValue} worth of each token`,
        variant: "destructive",
      });
      return;
    }

    // Show confirmation dialog for large amounts
    if (valueA > 5000 || valueB > 5000) {
      const confirmed = window.confirm(
        `⚠️ Large Liquidity Addition Warning\n\n` +
        `You are adding approximately $${valueA.toFixed(2)} worth of liquidity.\n\n` +
        `Please verify:\n` +
        `• Token amounts are correct\n` +
        `• Slippage tolerance is acceptable (${slippage}%)\n` +
        `• You trust this pool\n\n` +
        `Continue?`
      );
      if (!confirmed) return;
    }

    setIsLoading(true);
    
    try {
      // For demo: Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Liquidity Added! 🎉",
        description: `Added ${amountA} ${tokenA?.symbol} + ${amountB} ${tokenB?.symbol}`,
      });
      
      // Reset form
      setAmountA("");
      setAmountB("");
      setPriceWarning(false);
      
    } catch (error: any) {
      console.error("Add liquidity error:", error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const usdValueA = amountA && tokenA ? (parseFloat(amountA) * getTokenPrice(tokenA.symbol)).toFixed(2) : "0";
  const usdValueB = amountB && tokenB ? (parseFloat(amountB) * getTokenPrice(tokenB.symbol)).toFixed(2) : "0";
  const sharePercentage = (parseFloat(usdValueA) + parseFloat(usdValueB)) > 0 ? "~0.01" : "0";

  // Token selection modal
  const TokenSelectModal = ({ type, onClose }: { type: "A" | "B", onClose: () => void }) => {
    const filteredTokens = tokens.filter(t => 
      t.symbol.toLowerCase().includes(tokenSearchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(tokenSearchQuery.toLowerCase())
    );
    
    const handleSelect = (token: Token) => {
      if (type === "A") {
        if (tokenB && token.mint === tokenB.mint) {
          setTokenB(tokenA);
        }
        setTokenA(token);
      } else {
        if (tokenA && token.mint === tokenA.mint) {
          setTokenA(tokenB);
        }
        setTokenB(token);
      }
      setTokenSearchQuery("");
      onClose();
      setAmountA("");
      setAmountB("");
    };
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-card rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col border border-border">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-semibold">Select Token</h3>
            <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or symbol..."
                value={tokenSearchQuery}
                onChange={(e) => setTokenSearchQuery(e.target.value)}
                className="w-full bg-secondary rounded-xl pl-9 pr-4 py-2 outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {isLoadingTokens ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredTokens.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tokens found
              </div>
            ) : (
              filteredTokens.map((token) => (
                <button
                  key={token.mint}
                  onClick={() => handleSelect(token)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-secondary rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xl">
                    {token.logoURI ? (
                      <img src={token.logoURI} alt={token.symbol} className="w-6 h-6 rounded-full" onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }} />
                    ) : (
                      token.icon
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{token.symbol}</div>
                    <div className="text-xs text-muted-foreground">{token.name}</div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    ${getTokenPrice(token.symbol).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!tokenA || !tokenB) {
    return (
      <DexLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DexLayout>
    );
  }

  return (
    <DexLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-display font-bold">Add Liquidity</h1>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary">
              <Info className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-card rounded-2xl p-4 space-y-4 border border-border">
            {/* Token A */}
            <div className="bg-secondary/30 rounded-xl p-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Token A</span>
                <span>≈ ${usdValueA} USD</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="0.00"
                  value={amountA}
                  onChange={(e) => handleAmountAChange(e.target.value)}
                  className="flex-1 bg-transparent text-2xl font-bold outline-none placeholder:text-muted-foreground/30 w-0"
                />
                <button
                  onClick={() => setShowTokenSelect("A")}
                  className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 transition-colors px-3 py-1.5 rounded-full font-semibold text-sm"
                >
                  {tokenA.logoURI ? (
                    <img src={tokenA.logoURI} alt={tokenA.symbol} className="w-5 h-5 rounded-full" />
                  ) : (
                    <span className="text-lg">{tokenA.icon}</span>
                  )}
                  {tokenA.symbol}
                </button>
              </div>
            </div>

            {/* Plus icon */}
            <div className="flex justify-center -my-2">
              <div className="w-8 h-8 rounded-full bg-secondary border-2 border-card flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
            </div>

            {/* Token B */}
            <div className="bg-secondary/30 rounded-xl p-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Token B</span>
                <span>≈ ${usdValueB} USD</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="0.00"
                  value={amountB}
                  onChange={(e) => handleAmountBChange(e.target.value)}
                  className="flex-1 bg-transparent text-2xl font-bold outline-none placeholder:text-muted-foreground/30 w-0"
                />
                <button
                  onClick={() => setShowTokenSelect("B")}
                  className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 transition-colors px-3 py-1.5 rounded-full font-semibold text-sm"
                >
                  {tokenB.logoURI ? (
                    <img src={tokenB.logoURI} alt={tokenB.symbol} className="w-5 h-5 rounded-full" />
                  ) : (
                    <span className="text-lg">{tokenB.icon}</span>
                  )}
                  {tokenB.symbol}
                </button>
              </div>
            </div>

            {/* Price warning */}
            {priceWarning && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                <div className="text-xs text-yellow-600">
                  <p className="font-medium">Large Liquidity Addition</p>
                  <p>Adding large amounts may cause significant price impact.</p>
                </div>
              </div>
            )}

            {/* Pool Information */}
            {(amountA || amountB) && (
              <div className="bg-secondary/20 rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Pool Share</span>
                  <span className="font-medium">{sharePercentage}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Price {tokenA.symbol}/{tokenB.symbol}</span>
                  <span className="font-medium">
                    1 {tokenA.symbol} = {(getTokenPrice(tokenA.symbol) / getTokenPrice(tokenB.symbol)).toFixed(6)} {tokenB.symbol}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Price {tokenB.symbol}/{tokenA.symbol}</span>
                  <span className="font-medium">
                    1 {tokenB.symbol} = {(getTokenPrice(tokenB.symbol) / getTokenPrice(tokenA.symbol)).toFixed(6)} {tokenA.symbol}
                  </span>
                </div>
              </div>
            )}

            {/* Slippage Settings */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Slippage Tolerance</span>
                <span className="font-medium">{slippage}%</span>
              </div>
              <div className="flex gap-2">
                {[0.1, 0.5, 1.0].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSlippage(s)}
                    className={`flex-1 text-xs py-1.5 rounded-lg transition-colors ${
                      slippage === s ? "bg-primary/10 text-primary font-medium" : "bg-secondary/50 hover:bg-secondary"
                    }`}
                  >
                    {s}%
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Your transaction will revert if price changes by more than {slippage}%
              </p>
            </div>

            {/* Safety Notes */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
              <p className="text-xs text-blue-600 font-medium mb-1">⚠️ Important Safety Notes</p>
              <ul className="text-[10px] text-blue-600/80 space-y-1 list-disc list-inside">
                <li>Only add liquidity to tokens you trust</li>
                <li>Check the pool's total value locked (TVL)</li>
                <li>Be aware of impermanent loss risk</li>
                <li>Start with small amounts to test</li>
                <li>Never share your recovery phrase</li>
              </ul>
            </div>

            {/* Action Button */}
            {!user ? (
              <Button className="w-full h-12" onClick={() => navigate("/auth")}>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In to Add Liquidity
              </Button>
            ) : !walletConnected ? (
              <div className="space-y-3">
                <Button 
                  className="w-full h-12"
                  onClick={handleWalletConnect}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet to Add Liquidity
                </Button>
              </div>
            ) : (
              <Button
                className="w-full h-12 font-semibold"
                disabled={isLoading || !amountA || !amountB}
                onClick={addLiquidity}
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing...</>
                ) : (
                  `Add ${tokenA.symbol} + ${tokenB.symbol} Liquidity`
                )}
              </Button>
            )}
          </div>

          {/* Pool Info */}
          <div className="mt-4 text-center text-xs text-muted-foreground">
            <p>You will receive LP tokens representing your share of the pool</p>
            <p className="mt-1">LP tokens can be redeemed for your portion of the pool at any time</p>
          </div>
        </div>
      </div>
      
      {showTokenSelect && (
        <TokenSelectModal type={showTokenSelect} onClose={() => setShowTokenSelect(null)} />
      )}
    </DexLayout>
  );
};

export default AddLiquidity;