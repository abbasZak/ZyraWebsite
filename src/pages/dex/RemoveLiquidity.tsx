import { useState, useEffect } from "react";
import { Minus, Loader2, AlertTriangle, Info, Wallet, LogIn, Trash2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import DexLayout from "@/components/dex/DexLayout";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";

interface PoolPosition {
  tokenASymbol: string;
  tokenBSymbol: string;
  tokenAIcon: string;
  tokenBIcon: string;
  tokenAMint: string;
  tokenBMint: string;
  lpTokens: number;
  tokenAAmount: number;
  tokenBAmount: number;
  sharePercentage: number;
  valueUSD: number;
}

const RemoveLiquidity = () => {
  const [selectedPool, setSelectedPool] = useState<PoolPosition | null>(null);
  const [removePercentage, setRemovePercentage] = useState(0);
  const [slippage, setSlippage] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [showPoolSelect, setShowPoolSelect] = useState(false);
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({});
  
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mock user's liquidity positions - In production, fetch from blockchain
  const [userPools, setUserPools] = useState<PoolPosition[]>([
    {
      tokenASymbol: "SOL",
      tokenBSymbol: "USDC",
      tokenAIcon: "◎",
      tokenBIcon: "💲",
      tokenAMint: "So11111111111111111111111111111111111111112",
      tokenBMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      lpTokens: 150.5,
      tokenAAmount: 2.5,
      tokenBAmount: 450,
      sharePercentage: 0.15,
      valueUSD: 900,
    },
    {
      tokenASymbol: "SOL",
      tokenBSymbol: "USDT",
      tokenAIcon: "◎",
      tokenBIcon: "💵",
      tokenAMint: "So11111111111111111111111111111111111111112",
      tokenBMint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
      lpTokens: 75.2,
      tokenAAmount: 1.2,
      tokenBAmount: 216,
      sharePercentage: 0.08,
      valueUSD: 432,
    },
  ]);

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

  const handleRemoveLiquidity = async () => {
    if (!selectedPool) {
      toast({
        title: "No Pool Selected",
        description: "Please select a pool to remove liquidity from",
        variant: "destructive",
      });
      return;
    }

    if (removePercentage <= 0 || removePercentage > 100) {
      toast({
        title: "Invalid Percentage",
        description: "Please select a valid percentage (1-100)",
        variant: "destructive",
      });
      return;
    }

    // Safety warning for large withdrawals
    if (removePercentage > 50) {
      const confirmed = window.confirm(
        `⚠️ Large Withdrawal Warning\n\n` +
        `You are removing ${removePercentage}% of your liquidity from the ${selectedPool.tokenASymbol}/${selectedPool.tokenBSymbol} pool.\n\n` +
        `You will receive approximately:\n` +
        `• ${((selectedPool.tokenAAmount * removePercentage) / 100).toFixed(4)} ${selectedPool.tokenASymbol}\n` +
        `• ${((selectedPool.tokenBAmount * removePercentage) / 100).toFixed(2)} ${selectedPool.tokenBSymbol}\n\n` +
        `Slippage tolerance: ${slippage}%\n\n` +
        `Continue?`
      );
      if (!confirmed) return;
    }

    setIsLoading(true);
    
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Liquidity Removed! 🎉",
        description: `Removed ${removePercentage}% of ${selectedPool.tokenASymbol}/${selectedPool.tokenBSymbol} liquidity`,
      });
      
      // Update local state (in production, refresh from blockchain)
      const updatedPools = userPools.map(pool => {
        if (pool === selectedPool) {
          const remainingPercentage = 100 - removePercentage;
          if (remainingPercentage === 0) {
            return null; // Remove pool completely
          }
          return {
            ...pool,
            lpTokens: (pool.lpTokens * remainingPercentage) / 100,
            tokenAAmount: (pool.tokenAAmount * remainingPercentage) / 100,
            tokenBAmount: (pool.tokenBAmount * remainingPercentage) / 100,
            sharePercentage: (pool.sharePercentage * remainingPercentage) / 100,
            valueUSD: (pool.valueUSD * remainingPercentage) / 100,
          };
        }
        return pool;
      }).filter((pool): pool is PoolPosition => pool !== null);
      
      setUserPools(updatedPools);
      setSelectedPool(null);
      setRemovePercentage(0);
      
    } catch (error: any) {
      console.error("Remove liquidity error:", error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const tokenToReceiveA = selectedPool 
    ? ((selectedPool.tokenAAmount * removePercentage) / 100).toFixed(4)
    : "0";
  const tokenToReceiveB = selectedPool 
    ? ((selectedPool.tokenBAmount * removePercentage) / 100).toFixed(2)
    : "0";
  const lpToBurn = selectedPool 
    ? ((selectedPool.lpTokens * removePercentage) / 100).toFixed(2)
    : "0";
  const estimatedValueA = selectedPool && tokenToReceiveA !== "0"
    ? (parseFloat(tokenToReceiveA) * getTokenPrice(selectedPool.tokenASymbol)).toFixed(2)
    : "0";
  const estimatedValueB = selectedPool && tokenToReceiveB !== "0"
    ? (parseFloat(tokenToReceiveB) * getTokenPrice(selectedPool.tokenBSymbol)).toFixed(2)
    : "0";

  return (
    <DexLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-display font-bold">Remove Liquidity</h1>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary">
              <Info className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-card rounded-2xl p-4 space-y-4 border border-border">
            {/* Pool Selection Dropdown */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Select Pool</label>
              
              {userPools.length > 0 ? (
                <>
                  <button
                    onClick={() => setShowPoolSelect(!showPoolSelect)}
                    className="w-full p-3 rounded-xl border border-border bg-secondary/20 flex items-center justify-between hover:bg-secondary/30 transition-colors"
                  >
                    {selectedPool ? (
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-1">
                          <span className="text-xl">{selectedPool.tokenAIcon}</span>
                          <span className="text-xl">{selectedPool.tokenBIcon}</span>
                        </div>
                        <div>
                          <div className="font-semibold">
                            {selectedPool.tokenASymbol}/{selectedPool.tokenBSymbol}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {selectedPool.lpTokens.toFixed(2)} LP tokens
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Select a pool</span>
                    )}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showPoolSelect ? "rotate-180" : ""}`} />
                  </button>

                  {showPoolSelect && (
                    <div className="mt-2 border border-border rounded-xl overflow-hidden bg-card">
                      {userPools.map((pool, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedPool(pool);
                            setShowPoolSelect(false);
                            setRemovePercentage(0);
                          }}
                          className="w-full p-3 text-left hover:bg-secondary/30 transition-colors border-b border-border last:border-0"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex -space-x-1">
                                <span className="text-xl">{pool.tokenAIcon}</span>
                                <span className="text-xl">{pool.tokenBIcon}</span>
                              </div>
                              <div>
                                <div className="font-medium">
                                  {pool.tokenASymbol}/{pool.tokenBSymbol}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {pool.lpTokens.toFixed(2)} LP | ${pool.valueUSD.toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-green-500">{pool.sharePercentage}%</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 bg-secondary/20 rounded-xl">
                  <p className="text-muted-foreground mb-3">No liquidity positions found</p>
                  <Button 
                    variant="outline"
                    onClick={() => navigate("/dex/liquidity")}
                  >
                    Add Liquidity First
                  </Button>
                </div>
              )}
            </div>

            {/* Remove Percentage Slider */}
            {selectedPool && (
              <>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Remove Percentage</span>
                    <span className="font-bold text-primary">{removePercentage}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={removePercentage}
                    onChange={(e) => setRemovePercentage(parseInt(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex gap-2">
                    {[25, 50, 75, 100].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => setRemovePercentage(pct)}
                        className="flex-1 text-xs py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current Position Summary */}
                <div className="bg-secondary/20 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-2">Current Position</p>
                  <div className="flex justify-between text-sm">
                    <span>{selectedPool.tokenAAmount.toFixed(4)} {selectedPool.tokenASymbol}</span>
                    <span className="text-muted-foreground">+</span>
                    <span>{selectedPool.tokenBAmount.toFixed(2)} {selectedPool.tokenBSymbol}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>≈ ${(selectedPool.tokenAAmount * getTokenPrice(selectedPool.tokenASymbol)).toFixed(2)}</span>
                    <span>≈ ${(selectedPool.tokenBAmount * getTokenPrice(selectedPool.tokenBSymbol)).toFixed(2)}</span>
                  </div>
                </div>

                {/* You Will Receive */}
                {removePercentage > 0 && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 space-y-3">
                    <p className="text-xs text-green-600 font-medium">You will receive</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{selectedPool.tokenAIcon}</span>
                        <span className="text-sm font-medium">{selectedPool.tokenASymbol}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{tokenToReceiveA}</div>
                        <div className="text-xs text-muted-foreground">≈ ${estimatedValueA}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{selectedPool.tokenBIcon}</span>
                        <span className="text-sm font-medium">{selectedPool.tokenBSymbol}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{tokenToReceiveB}</div>
                        <div className="text-xs text-muted-foreground">≈ ${estimatedValueB}</div>
                      </div>
                    </div>
                    <div className="border-t border-green-500/20 pt-2 mt-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">LP Tokens to Burn</span>
                        <span className="font-mono">{lpToBurn} LP</span>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-muted-foreground">Total Value</span>
                        <span className="font-medium">≈ ${(parseFloat(estimatedValueA) + parseFloat(estimatedValueB)).toFixed(2)}</span>
                      </div>
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

                {/* Warning for high percentage */}
                {removePercentage === 100 && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-red-600">
                      <p className="font-medium">Full Withdrawal</p>
                      <p>You are removing ALL your liquidity from this pool. This will close your entire position.</p>
                    </div>
                  </div>
                )}

                {removePercentage > 0 && removePercentage < 100 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-yellow-600">
                      <p>You will keep {100 - removePercentage}% of your position in this pool</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Action Button */}
            {!user ? (
              <Button className="w-full h-12" onClick={() => navigate("/auth")}>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In to Remove Liquidity
              </Button>
            ) : !walletConnected ? (
              <Button 
                className="w-full h-12"
                onClick={() => {
                  const walletBtn = document.querySelector('[data-tour="wallet"] button');
                  if (walletBtn) (walletBtn as HTMLButtonElement).click();
                }}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            ) : (
              <Button
                className="w-full h-12 font-semibold"
                disabled={!selectedPool || removePercentage === 0 || isLoading}
                onClick={handleRemoveLiquidity}
                variant={removePercentage === 100 ? "destructive" : "default"}
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing...</>
                ) : !selectedPool ? (
                  "Select a Pool"
                ) : removePercentage === 0 ? (
                  "Select Percentage"
                ) : removePercentage === 100 ? (
                  <><Trash2 className="w-4 h-4 mr-2" />Remove All Liquidity</>
                ) : (
                  `Remove ${removePercentage}% Liquidity`
                )}
              </Button>
            )}
          </div>

          {/* Safety Info */}
          <div className="mt-4 text-center text-xs text-muted-foreground space-y-1">
            <p>⚠️ Removing liquidity will burn your LP tokens</p>
            <p>You will receive your share of the pool including earned fees</p>
            <p className="text-[10px]">Transaction may take a few moments to confirm</p>
          </div>
        </div>
      </div>
    </DexLayout>
  );
};

export default RemoveLiquidity;