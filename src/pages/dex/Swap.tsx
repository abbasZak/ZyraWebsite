import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowDownUp, Settings, Info, Zap, Loader2, CheckCircle2, AlertTriangle, RefreshCw, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import DexLayout from "@/components/dex/DexLayout";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useConnection } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";

interface Token {
  symbol: string;
  name: string;
  icon: string;
  mint: string;
  decimals: number;
  coingeckoId?: string;
}

const tokens: Token[] = [
  { symbol: "SOL", name: "Solana", icon: "◎", mint: "So11111111111111111111111111111111111111112", decimals: 9, coingeckoId: "solana" },
  { symbol: "USDC", name: "USD Coin", icon: "💲", mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6, coingeckoId: "usd-coin" },
  { symbol: "USDT", name: "Tether", icon: "💵", mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", decimals: 6, coingeckoId: "tether" },
  { symbol: "BONK", name: "Bonk", icon: "🦴", mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", decimals: 5, coingeckoId: "bonk" },
  { symbol: "RAY", name: "Raydium", icon: "☀️", mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", decimals: 6, coingeckoId: "raydium" },
  { symbol: "JUP", name: "Jupiter", icon: "🪐", mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", decimals: 6, coingeckoId: "jupiter-exchange-solana" },
  { symbol: "ORCA", name: "Orca", icon: "🐋", mint: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE", decimals: 6, coingeckoId: "orca" },
  { symbol: "WIF", name: "Dogwifhat", icon: "🎩", mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", decimals: 6, coingeckoId: "dogwifcoin" },
  { symbol: "JTO", name: "Jito", icon: "⚙️", mint: "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL", decimals: 9, coingeckoId: "jito-governance-token" },
  { symbol: "PYTH", name: "Pyth Network", icon: "🔮", mint: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3", decimals: 6, coingeckoId: "pyth-network" },
];

const JUPITER_QUOTE_API = "https://quote-api.jup.ag/v6/quote";
const JUPITER_SWAP_API = "https://quote-api.jup.ag/v6/swap";

type SwapState = "idle" | "quoting" | "quoted" | "swapping" | "success" | "error";

const Swap = () => {
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [swapState, setSwapState] = useState<SwapState>("idle");
  const [quoteData, setQuoteData] = useState<any>(null);
  const [outputAmount, setOutputAmount] = useState("");
  const [priceImpact, setPriceImpact] = useState("");
  const [routeLabel, setRouteLabel] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [prices, setPrices] = useState<Record<string, number>>({});
  const quoteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { publicKey, connected, signTransaction } = useWallet();
  const { setVisible } = useWalletModal();
  const { connection } = useConnection();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch live prices
  useEffect(() => {
    const ids = tokens.filter(t => t.coingeckoId).map(t => t.coingeckoId).join(",");
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`)
      .then(r => r.json())
      .then(data => {
        const map: Record<string, number> = {};
        tokens.forEach(t => {
          if (t.coingeckoId && data[t.coingeckoId]) {
            map[t.symbol] = data[t.coingeckoId].usd;
          }
        });
        setPrices(map);
      })
      .catch(() => {});
  }, []);

  const getPrice = (symbol: string) => prices[symbol] || 0;

  // Fetch Jupiter quote directly
  const fetchQuote = useCallback(async (amount: string, from: Token, to: Token, slip: number) => {
    if (!amount || parseFloat(amount) <= 0) {
      setQuoteData(null);
      setOutputAmount("");
      setPriceImpact("");
      setRouteLabel("");
      setSwapState("idle");
      return;
    }

    setSwapState("quoting");
    setErrorMsg("");

    const lamports = Math.floor(parseFloat(amount) * Math.pow(10, from.decimals));

    try {
      const params = new URLSearchParams({
        inputMint: from.mint,
        outputMint: to.mint,
        amount: lamports.toString(),
        slippageBps: Math.round(slip * 100).toString(),
      });

      const resp = await fetch(`${JUPITER_QUOTE_API}?${params}`);
      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(errText || "Quote request failed");
      }

      const data = await resp.json();
      if (data.error) throw new Error(data.error);

      setQuoteData(data);
      const outAmt = parseInt(data.outAmount) / Math.pow(10, to.decimals);
      setOutputAmount(outAmt.toFixed(to.decimals <= 6 ? 6 : 4));
      setPriceImpact(data.priceImpactPct ? `${parseFloat(data.priceImpactPct).toFixed(3)}%` : "<0.001%");

      if (data.routePlan?.length) {
        const labels = data.routePlan.map((r: any) => r.swapInfo?.label || "").filter(Boolean);
        setRouteLabel(labels.join(" → ") || "Jupiter");
      } else {
        setRouteLabel("Jupiter Aggregator");
      }

      setSwapState("quoted");
    } catch (e: any) {
      setSwapState("error");
      setErrorMsg(e.message || "Failed to fetch quote");
    }
  }, []);

  // Debounce
  useEffect(() => {
    if (quoteTimer.current) clearTimeout(quoteTimer.current);
    quoteTimer.current = setTimeout(() => {
      fetchQuote(fromAmount, fromToken, toToken, slippage);
    }, 500);
    return () => { if (quoteTimer.current) clearTimeout(quoteTimer.current); };
  }, [fromAmount, fromToken, toToken, slippage, fetchQuote]);

  const flipTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount("");
    setQuoteData(null);
    setOutputAmount("");
    setSwapState("idle");
  };

  const executeSwap = async () => {
    if (!connected || !publicKey || !signTransaction || !quoteData) return;
    setSwapState("swapping");
    setErrorMsg("");

    try {
      const swapResp = await fetch(JUPITER_SWAP_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteResponse: quoteData,
          userPublicKey: publicKey.toBase58(),
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: "auto",
        }),
      });

      if (!swapResp.ok) throw new Error("Failed to build swap transaction");

      const { swapTransaction } = await swapResp.json();
      const swapTxBuf = Buffer.from(swapTransaction, "base64");
      const tx = VersionedTransaction.deserialize(swapTxBuf);
      const signedTx = await signTransaction(tx);

      const rawTx = signedTx.serialize();
      const txid = await connection.sendRawTransaction(rawTx, {
        skipPreflight: true,
        maxRetries: 3,
      });

      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        signature: txid,
      }, "confirmed");

      setSwapState("success");
      toast({
        title: "Swap Successful! 🎉",
        description: `Swapped ${fromAmount} ${fromToken.symbol} for ${outputAmount} ${toToken.symbol}`,
      });

      setTimeout(() => {
        setFromAmount("");
        setOutputAmount("");
        setQuoteData(null);
        setSwapState("idle");
      }, 3000);
    } catch (e: any) {
      setSwapState("error");
      const msg = e.message || "Swap failed";
      setErrorMsg(msg);
      toast({ title: "Swap Failed", description: msg, variant: "destructive" });
    }
  };

  const fromUsd = fromAmount ? (parseFloat(fromAmount) * getPrice(fromToken.symbol)).toFixed(2) : "";
  const toUsd = outputAmount ? (parseFloat(outputAmount) * getPrice(toToken.symbol)).toFixed(2) : "";
  const rate = outputAmount && fromAmount ? (parseFloat(outputAmount) / parseFloat(fromAmount)).toFixed(6) : null;

  return (
    <DexLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-display font-bold">Swap</h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                Powered by Jupiter
              </span>
            </div>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>

          <div className="glass rounded-2xl p-4 space-y-1 gradient-border">
            {/* From */}
            <div className="bg-secondary/30 rounded-xl p-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>You pay</span>
                <span>Balance: —</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="flex-1 bg-transparent text-2xl font-bold outline-none placeholder:text-muted-foreground/30 w-0"
                />
                <select
                  value={fromToken.symbol}
                  onChange={(e) => {
                    const t = tokens.find((tk) => tk.symbol === e.target.value);
                    if (t && t.symbol !== toToken.symbol) setFromToken(t);
                  }}
                  className="appearance-none bg-secondary hover:bg-secondary/80 transition-colors px-3 py-1.5 rounded-full font-semibold text-sm cursor-pointer outline-none shrink-0"
                >
                  {tokens.map((t) => (
                    <option key={t.symbol} value={t.symbol}>{t.icon} {t.symbol}</option>
                  ))}
                </select>
              </div>
              {fromUsd && <p className="text-xs text-muted-foreground mt-1">≈ ${fromUsd}</p>}
            </div>

            {/* Flip */}
            <div className="flex justify-center -my-3 relative z-10">
              <button onClick={flipTokens} className="w-9 h-9 rounded-xl bg-secondary border-2 border-background flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors">
                <ArrowDownUp className="w-4 h-4" />
              </button>
            </div>

            {/* To */}
            <div className="bg-secondary/30 rounded-xl p-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>You receive</span>
                <span>Balance: —</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2">
                  {swapState === "quoting" ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  ) : (
                    <input type="text" placeholder="0.00" value={outputAmount} readOnly className="flex-1 bg-transparent text-2xl font-bold outline-none placeholder:text-muted-foreground/30 w-0" />
                  )}
                </div>
                <select
                  value={toToken.symbol}
                  onChange={(e) => {
                    const t = tokens.find((tk) => tk.symbol === e.target.value);
                    if (t && t.symbol !== fromToken.symbol) setToToken(t);
                  }}
                  className="appearance-none bg-secondary hover:bg-secondary/80 transition-colors px-3 py-1.5 rounded-full font-semibold text-sm cursor-pointer outline-none shrink-0"
                >
                  {tokens.map((t) => (
                    <option key={t.symbol} value={t.symbol}>{t.icon} {t.symbol}</option>
                  ))}
                </select>
              </div>
              {toUsd && <p className="text-xs text-muted-foreground mt-1">≈ ${toUsd}</p>}
            </div>

            {/* Quote details */}
            {swapState === "quoted" && rate && (
              <div className="pt-3 space-y-1.5 text-xs text-muted-foreground animate-in fade-in duration-300">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1"><Info className="w-3 h-3" />Rate</span>
                  <span>1 {fromToken.symbol} = {rate} {toToken.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price Impact</span>
                  <span className={parseFloat(priceImpact) > 1 ? "text-destructive" : "text-primary"}>{priceImpact}</span>
                </div>
                <div className="flex justify-between">
                  <span>Slippage Tolerance</span>
                  <span>{slippage}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Route</span>
                  <span className="text-primary">{routeLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Network Fee</span>
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-primary" />~$0.002</span>
                </div>
              </div>
            )}

            {swapState === "error" && errorMsg && (
              <div className="pt-3 flex items-center gap-2 text-xs text-destructive">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{errorMsg}</span>
                <button onClick={() => fetchQuote(fromAmount, fromToken, toToken, slippage)} className="shrink-0">
                  <RefreshCw className="w-3 h-3 hover:text-foreground" />
                </button>
              </div>
            )}

            {swapState === "success" && (
              <div className="pt-3 flex items-center gap-2 text-xs text-primary">
                <CheckCircle2 className="w-4 h-4" />
                <span>Swap confirmed on-chain!</span>
              </div>
            )}

            {/* CTA */}
            {!user ? (
              <Button className="w-full mt-3 h-12 text-base font-semibold glow-sm" size="lg" onClick={() => navigate("/auth")}>
                <LogIn className="w-4 h-4 mr-2" /> Sign In to Swap
              </Button>
            ) : !connected ? (
              <Button className="w-full mt-3 h-12 text-base font-semibold glow-sm" size="lg" onClick={() => setVisible(true)}>
                Connect Wallet to Swap
              </Button>
            ) : (
              <Button
                className="w-full mt-3 h-12 text-base font-semibold glow-sm"
                size="lg"
                disabled={swapState !== "quoted" || !quoteData}
                onClick={executeSwap}
              >
                {swapState === "swapping" ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Swapping...</span>
                ) : swapState === "quoting" ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Fetching quote...</span>
                ) : swapState === "success" ? (
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />Done!</span>
                ) : !fromAmount || parseFloat(fromAmount) <= 0 ? (
                  "Enter an amount"
                ) : swapState === "error" ? (
                  "Try again"
                ) : (
                  `Swap ${fromToken.symbol} → ${toToken.symbol}`
                )}
              </Button>
            )}
          </div>

          {/* Slippage */}
          <div className="mt-3 flex items-center gap-2 justify-center">
            <span className="text-xs text-muted-foreground">Slippage:</span>
            {[0.1, 0.5, 1.0, 3.0].map((s) => (
              <button
                key={s}
                onClick={() => setSlippage(s)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${slippage === s ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary/50"}`}
              >
                {s}%
              </button>
            ))}
          </div>

          {/* Live prices */}
          {Object.keys(prices).length > 0 && (
            <div className="mt-4 glass rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground mb-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Live Prices
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {tokens.slice(0, 6).map(t => (
                  <span key={t.symbol} className="text-muted-foreground">
                    {t.icon} {t.symbol} <span className="text-foreground font-medium">${getPrice(t.symbol).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DexLayout>
  );
};

export default Swap;
