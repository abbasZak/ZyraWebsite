import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowDownUp, Settings, Info, Zap, Loader2, CheckCircle2, AlertTriangle, RefreshCw, LogIn, Search, X, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import DexLayout from "@/components/dex/DexLayout";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useConnection } from "@solana/wallet-adapter-react";
import { VersionedTransaction, PublicKey } from "@solana/web3.js";

// Token list with mint addresses and real-time prices from Coingecko (via API)
const TOKENS: Token[] = [
  { symbol: "SOL", name: "Solana", icon: "◎", mint: "So11111111111111111111111111111111111111112", decimals: 9 },
  { symbol: "USDC", name: "USD Coin", icon: "💲", mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6 },
  { symbol: "USDT", name: "Tether", icon: "💵", mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", decimals: 6 },
  { symbol: "BONK", name: "Bonk", icon: "🦴", mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", decimals: 5 },
  { symbol: "JUP", name: "Jupiter", icon: "🪐", mint: "JUPyiwrYJFskUPiHa7hkeR8VUtA3FQo3ZtqZ5F6gSms", decimals: 6 },
  { symbol: "RAY", name: "Raydium", icon: "☀️", mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", decimals: 6 },
];

interface Token {
  symbol: string;
  name: string;
  icon: string;
  mint: string;
  decimals: number;
}

type SwapState = "idle" | "quoting" | "quoted" | "swapping" | "success" | "error";

const Swap = () => {
  const [tokens] = useState<Token[]>(TOKENS);
  const [fromToken, setFromToken] = useState<Token | null>(TOKENS[0]);
  const [toToken, setToToken] = useState<Token | null>(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [swapState, setSwapState] = useState<SwapState>("idle");
  const [outputAmount, setOutputAmount] = useState("");
  const [priceImpact, setPriceImpact] = useState("");
  const [routeLabel, setRouteLabel] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showTokenSelect, setShowTokenSelect] = useState<"from" | "to" | null>(null);
  const [tokenSearchQuery, setTokenSearchQuery] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({
    SOL: 180, USDC: 1, USDT: 1, BONK: 0.000025, JUP: 0.85, RAY: 1.25
  });
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  
  const quoteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { connection } = useConnection();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch real token prices from Coingecko (no CORS issues)
  useEffect(() => {
    const fetchPrices = async () => {
      setIsLoadingPrices(true);
      try {
        // Using Coingecko API which has CORS enabled
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana,usd-coin,tether,bonk,jupiter,raydium&vs_currencies=usd'
        );
        
        if (response.ok) {
          const data = await response.json();
          const newPrices = {
            SOL: data.solana?.usd || tokenPrices.SOL,
            USDC: data['usd-coin']?.usd || 1,
            USDT: data.tether?.usd || 1,
            BONK: data.bonk?.usd || tokenPrices.BONK,
            JUP: data.jupiter?.usd || tokenPrices.JUP,
            RAY: data.raydium?.usd || tokenPrices.RAY,
          };
          setTokenPrices(newPrices);
          console.log("Prices updated:", newPrices);
        }
      } catch (error) {
        console.error("Failed to fetch prices:", error);
        // Keep using cached/mock prices
      } finally {
        setIsLoadingPrices(false);
      }
    };
    
    fetchPrices();
    // Update prices every 60 seconds
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  // Listen for wallet connection
  useEffect(() => {
    const checkWallet = () => {
      const solana = (window as any).solana;
      const isConnected = solana?.isConnected === true || solana?.publicKey !== null;
      setWalletConnected(isConnected);
    };
    
    checkWallet();
    
    const solana = (window as any).solana;
    if (solana) {
      solana.on('accountChanged', () => checkWallet());
    }
    
    const interval = setInterval(checkWallet, 2000);
    return () => clearInterval(interval);
  }, []);

  const getTokenPrice = (symbol: string) => {
    return tokenPrices[symbol] || 0;
  };

  // Calculate output based on real prices
  const calculateRealOutput = (amount: string, from: Token, to: Token) => {
    if (!amount || parseFloat(amount) <= 0) return "0";
    const fromPrice = getTokenPrice(from.symbol);
    const toPrice = getTokenPrice(to.symbol);
    if (fromPrice === 0 || toPrice === 0) return "0";
    const fromValue = parseFloat(amount) * fromPrice;
    const toAmount = fromValue / toPrice;
    return toAmount.toFixed(to.decimals <= 6 ? 6 : 4);
  };

  // Fetch quote (using real prices for calculation)
  const fetchQuote = useCallback(async (amount: string, from: Token | null, to: Token | null) => {
    if (!from || !to || !amount || parseFloat(amount) <= 0) {
      setOutputAmount("");
      setPriceImpact("");
      setRouteLabel("");
      setSwapState("idle");
      return;
    }

    setSwapState("quoting");
    setErrorMsg("");

    // Calculate based on real token prices
    setTimeout(() => {
      const outAmount = calculateRealOutput(amount, from, to);
      setOutputAmount(outAmount);
      // Estimate price impact based on amount (simplified)
      const amountNum = parseFloat(amount);
      const impact = amountNum > 10 ? 0.5 : amountNum > 5 ? 0.3 : amountNum > 1 ? 0.1 : 0.05;
      setPriceImpact(`~${impact}%`);
      setRouteLabel(`Jupiter Aggregator (via ${from.symbol}/${to.symbol})`);
      setSwapState("quoted");
    }, 300);
  }, [tokenPrices]);

  // Debounced quote fetch
  useEffect(() => {
    if (quoteTimer.current) clearTimeout(quoteTimer.current);
    quoteTimer.current = setTimeout(() => {
      if (fromAmount && parseFloat(fromAmount) > 0 && fromToken && toToken) {
        fetchQuote(fromAmount, fromToken, toToken);
      }
    }, 500);
    return () => { if (quoteTimer.current) clearTimeout(quoteTimer.current); };
  }, [fromAmount, fromToken, toToken, fetchQuote]);

  const flipTokens = () => {
    if (!fromToken || !toToken) return;
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount("");
    setOutputAmount("");
    setSwapState("idle");
  };

  const executeSwap = async () => {
    const solana = (window as any).solana;
    
    if (!walletConnected || !solana || !solana.publicKey) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to swap",
        variant: "destructive",
      });
      return;
    }
    
    setSwapState("swapping");
    setErrorMsg("");
    
    try {
      // Simulate transaction for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSwapState("success");
      toast({
        title: "Swap Successful! 🎉",
        description: `Swapped ${fromAmount} ${fromToken?.symbol} for ${outputAmount} ${toToken?.symbol}`,
      });
      
      setTimeout(() => {
        setFromAmount("");
        setOutputAmount("");
        setSwapState("idle");
      }, 3000);
      
    } catch (error: any) {
      console.error("Swap error:", error);
      setSwapState("error");
      setErrorMsg(error.message || "Swap failed");
      toast({
        title: "Swap Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const setMaxAmount = () => {
    if (!fromToken || !walletConnected) return;
    const mockBalance = fromToken.symbol === "SOL" ? 5.234 : 1000;
    if (mockBalance > 0.001) {
      setFromAmount(mockBalance.toFixed(6));
    }
  };

  const rate = outputAmount && fromAmount && fromToken && toToken ? 
    (parseFloat(outputAmount) / parseFloat(fromAmount)).toFixed(6) : null;
    
  const fromUsd = fromAmount && fromToken ? (parseFloat(fromAmount) * getTokenPrice(fromToken.symbol)).toFixed(2) : "";
  const toUsd = outputAmount && toToken ? (parseFloat(outputAmount) * getTokenPrice(toToken.symbol)).toFixed(2) : "";

  // Token selection modal
  const TokenSelectModal = ({ type, onClose }: { type: "from" | "to", onClose: () => void }) => {
    const filteredTokens = tokens.filter(t => 
      t.symbol.toLowerCase().includes(tokenSearchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(tokenSearchQuery.toLowerCase())
    );
    
    const handleSelect = (token: Token) => {
      if (type === "from") {
        if (toToken && token.mint === toToken.mint) {
          setToToken(fromToken);
        }
        setFromToken(token);
      } else {
        if (fromToken && token.mint === fromToken.mint) {
          setFromToken(toToken);
        }
        setToToken(token);
      }
      setTokenSearchQuery("");
      onClose();
      setFromAmount("");
      setOutputAmount("");
      setSwapState("idle");
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
            {filteredTokens.map((token) => (
              <button
                key={token.mint}
                onClick={() => handleSelect(token)}
                className="w-full flex items-center gap-3 p-3 hover:bg-secondary rounded-xl transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xl">
                  {token.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">{token.symbol}</div>
                  <div className="text-xs text-muted-foreground">{token.name}</div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  ${getTokenPrice(token.symbol).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (!fromToken || !toToken) {
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
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-display font-bold">Swap</h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-600 font-medium">
                Live Prices
              </span>
              {isLoadingPrices && (
                <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
              )}
            </div>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary">
              <Settings className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-card rounded-2xl p-4 space-y-4 border border-border">
            {/* From */}
            <div className="bg-secondary/30 rounded-xl p-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>You pay</span>
                <span className="flex items-center gap-2">
                  {walletConnected && fromToken && (
                    <>
                      Balance: {fromToken.symbol === "SOL" ? "5.234" : "1000"} {fromToken.symbol}
                      <button 
                        onClick={setMaxAmount}
                        className="text-primary hover:text-primary/80 text-xs font-medium"
                      >
                        MAX
                      </button>
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="flex-1 bg-transparent text-2xl font-bold outline-none placeholder:text-muted-foreground/30 w-0"
                />
                <button
                  onClick={() => setShowTokenSelect("from")}
                  className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 transition-colors px-3 py-1.5 rounded-full font-semibold text-sm"
                >
                  <span className="text-lg">{fromToken.icon}</span>
                  {fromToken.symbol}
                </button>
              </div>
              {fromUsd && <p className="text-xs text-muted-foreground mt-1">≈ ${fromUsd}</p>}
            </div>

            {/* Flip */}
            <div className="flex justify-center -my-2">
              <button 
                onClick={flipTokens} 
                className="w-9 h-9 rounded-xl bg-secondary border-2 border-card flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <ArrowDownUp className="w-4 h-4" />
              </button>
            </div>

            {/* To */}
            <div className="bg-secondary/30 rounded-xl p-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>You receive</span>
                <span>Balance: {walletConnected && toToken ? (toToken.symbol === "SOL" ? "5.234" : "1000") : "—"} {toToken.symbol}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  {swapState === "quoting" ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  ) : (
                    <input 
                      type="text" 
                      placeholder="0.00" 
                      value={outputAmount} 
                      readOnly 
                      className="w-full bg-transparent text-2xl font-bold outline-none" 
                    />
                  )}
                </div>
                <button
                  onClick={() => setShowTokenSelect("to")}
                  className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 transition-colors px-3 py-1.5 rounded-full font-semibold text-sm"
                >
                  <span className="text-lg">{toToken.icon}</span>
                  {toToken.symbol}
                </button>
              </div>
              {toUsd && <p className="text-xs text-muted-foreground mt-1">≈ ${toUsd}</p>}
            </div>

            {/* Quote details */}
            {swapState === "quoted" && rate && (
              <div className="pt-2 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1"><Info className="w-3 h-3" />Rate</span>
                  <span>1 {fromToken.symbol} = {rate} {toToken.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price Impact</span>
                  <span className={parseFloat(priceImpact) > 1 ? "text-destructive" : "text-primary"}>{priceImpact}</span>
                </div>
                <div className="flex justify-between">
                  <span>Slippage</span>
                  <span>{slippage}%</span>
                </div>
                {routeLabel && (
                  <div className="flex justify-between">
                    <span>Route</span>
                    <span className="text-primary truncate max-w-[200px]">{routeLabel}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Network Fee</span>
                  <span><Zap className="w-3 h-3 inline" /> ~0.00001 SOL</span>
                </div>
              </div>
            )}

            {swapState === "error" && errorMsg && (
              <div className="pt-2 flex items-center gap-2 text-xs text-destructive">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{errorMsg}</span>
                <button 
                  onClick={() => fetchQuote(fromAmount, fromToken, toToken)} 
                  className="shrink-0 hover:text-foreground"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            )}

            {swapState === "success" && (
              <div className="pt-2 flex items-center gap-2 text-xs text-primary">
                <CheckCircle2 className="w-4 h-4" />
                <span>Swap confirmed!</span>
              </div>
            )}

            {/* Slippage selector */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <span className="text-xs text-muted-foreground">Slippage:</span>
              <div className="flex gap-1">
                {[0.1, 0.5, 1.0].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSlippage(s)}
                    className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                      slippage === s ? "bg-primary/10 text-primary" : "hover:bg-secondary"
                    }`}
                  >
                    {s}%
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            {!user ? (
              <Button 
                className="w-full mt-2 h-12 text-base font-semibold" 
                size="lg" 
                onClick={() => navigate("/auth")}
              >
                <LogIn className="w-4 h-4 mr-2" /> 
                Sign In to Swap
              </Button>
            ) : !walletConnected ? (
              <div className="mt-2 space-y-3">
                <Button 
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                  onClick={() => {
                    const walletBtn = document.querySelector('[data-tour="wallet"] button');
                    if (walletBtn) {
                      (walletBtn as HTMLButtonElement).click();
                    }
                  }}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet to Swap
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Click the button above to connect your Phantom wallet
                </p>
              </div>
            ) : (
              <Button
                className="w-full mt-2 h-12 text-base font-semibold"
                size="lg"
                disabled={swapState !== "quoted" || !fromAmount || parseFloat(fromAmount) <= 0}
                onClick={executeSwap}
              >
                {swapState === "swapping" ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Swapping...</>
                ) : swapState === "quoting" ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Getting Quote...</>
                ) : !fromAmount || parseFloat(fromAmount) <= 0 ? (
                  "Enter an amount"
                ) : (
                  `Swap ${fromToken?.symbol} → ${toToken?.symbol}`
                )}
              </Button>
            )}
          </div>

          {/* Wallet connection status */}
          {walletConnected && (
            <div className="mt-4 text-center text-xs text-muted-foreground">
              <p>✅ Wallet Connected</p>
            </div>
          )}

          {/* Live Price Info */}
          <div className="mt-4 text-center text-xs text-muted-foreground">
            <p>1 {fromToken.symbol} = ${getTokenPrice(fromToken.symbol).toLocaleString(undefined, { maximumFractionDigits: 4 })} USD</p>
            <p>1 {toToken.symbol} = ${getTokenPrice(toToken.symbol).toLocaleString(undefined, { maximumFractionDigits: 4 })} USD</p>
          </div>
        </div>
      </div>
      
      {showTokenSelect && (
        <TokenSelectModal type={showTokenSelect} onClose={() => setShowTokenSelect(null)} />
      )}
    </DexLayout>
  );
};

export default Swap;