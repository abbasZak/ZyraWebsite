import { useState, useEffect } from "react";
import { Plus, Loader2, AlertTriangle, Info, Wallet, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import DexLayout from "@/components/dex/DexLayout";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useConnection } from "@solana/wallet-adapter-react";

// Token list
const TOKENS: Token[] = [
  { symbol: "SOL", name: "Solana", icon: "◎", mint: "So11111111111111111111111111111111111111112", decimals: 9 },
  { symbol: "USDC", name: "USD Coin", icon: "💲", mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6 },
  { symbol: "USDT", name: "Tether", icon: "💵", mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", decimals: 6 },
];

interface Token {
  symbol: string;
  name: string;
  icon: string;
  mint: string;
  decimals: number;
}

const AddLiquidity = () => {
  const [tokenA, setTokenA] = useState<Token | null>(TOKENS[0]);
  const [tokenB, setTokenB] = useState<Token | null>(TOKENS[1]);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const [priceWarning, setPriceWarning] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { connection } = useConnection();

  // Fetch token prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana,usd-coin,tether&vs_currencies=usd'
        );
        if (response.ok) {
          const data = await response.json();
          setTokenPrices({
            SOL: data.solana?.usd || 180,
            USDC: data['usd-coin']?.usd || 1,
            USDT: data.tether?.usd || 1,
          });
        }
      } catch (error) {
        console.error("Failed to fetch prices:", error);
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

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

  if (!tokenA || !tokenB) return null;

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
                <div className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-full">
                  <span className="text-lg">{tokenA.icon}</span>
                  <span className="font-semibold text-sm">{tokenA.symbol}</span>
                </div>
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
                <div className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-full">
                  <span className="text-lg">{tokenB.icon}</span>
                  <span className="font-semibold text-sm">{tokenB.symbol}</span>
                </div>
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
                  onClick={() => {
                    const walletBtn = document.querySelector('[data-tour="wallet"] button');
                    if (walletBtn) (walletBtn as HTMLButtonElement).click();
                  }}
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
    </DexLayout>
  );
};

export default AddLiquidity;