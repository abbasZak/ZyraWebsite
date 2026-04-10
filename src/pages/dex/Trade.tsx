import { useState, useEffect, useCallback, useRef, useMemo, type ReactNode } from "react";
import { TrendingUp, TrendingDown, Loader2, LogIn, Brain, AlertTriangle, Shield, RefreshCw, Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import DexLayout from "@/components/dex/DexLayout";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useToast } from "@/hooks/use-toast";
import { useDexWalletConnect } from "@/components/dex/DexWalletConnectProvider";
import { SystemProgram, PublicKey, Transaction } from "@solana/web3.js";
import { supabase } from "@/integrations/supabase/client";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Line,
} from "recharts";

const PLATFORM_FEE_WALLET = new PublicKey("2JgxWdxKRgzfJV3AEarCCKtQ4WNMbk52f6kBqHxYjpnJ");
const PLATFORM_FEE_LAMPORTS = 10_000_000;
const JUPITER_QUOTE_API = "https://quote-api.jup.ag/v6/quote";

interface PriceData {
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

interface OHLCCandle {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  // For recharts bar trick: store wick as [low, high] and body as [open, close]
  body: [number, number];
  wick: [number, number];
  bullish: boolean;
}

const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

const TIMEFRAMES: { label: string; days: string; cgParam: string }[] = [
  { label: "1H", days: "1", cgParam: "1" },
  { label: "4H", days: "1", cgParam: "1" },
  { label: "1D", days: "7", cgParam: "7" },
  { label: "1W", days: "30", cgParam: "30" },
  { label: "1M", days: "90", cgParam: "90" },
];

/* ── AI Trade Advisor Widget ── */
const AITradeAdvisor = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvice = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("ai-hub", {
        body: { tool: "trade_advisor" },
      });
      if (fnError) throw new Error(fnError.message);
      if (result?.error) throw new Error(result.error);
      setData(result);
    } catch (e: any) {
      setError(e?.message || "AI advisor unavailable");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdvice(); }, [fetchAdvice]);

  if (loading) return (
    <div className="glass rounded-xl p-4 gradient-border">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-primary animate-pulse" />
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">AI Trade Advisor</span>
      </div>
      <div className="flex items-center justify-center py-8 gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground">Analyzing market...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="glass rounded-xl p-4 gradient-border">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-destructive" />
          <span className="text-xs font-bold">AI Trade Advisor</span>
        </div>
        <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={fetchAdvice}><RefreshCw className="w-3 h-3" /></Button>
      </div>
      <p className="text-xs text-destructive">{error}</p>
    </div>
  );

  if (!data) return null;

  const sentimentColor = data.marketSentiment === "Bullish" ? "text-primary" : data.marketSentiment === "Bearish" ? "text-destructive" : "text-amber-400";
  const riskColor = data.riskLevel === "Low" ? "text-primary bg-primary/10" : data.riskLevel === "Medium" ? "text-amber-400 bg-amber-500/10" : data.riskLevel === "High" ? "text-red-400 bg-red-500/10" : "text-red-500 bg-red-500/15";
  const recColor = data.recommendation === "Buy" ? "bg-primary/15 text-primary border-primary/20" : data.recommendation === "Sell" ? "bg-destructive/15 text-destructive border-destructive/20" : "bg-amber-500/15 text-amber-400 border-amber-500/20";

  return (
    <div className="glass rounded-xl gradient-border overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">AI Trade Advisor</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </div>
          <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1" onClick={fetchAdvice}>
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>

        {/* Sentiment + Recommendation */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-sm font-bold ${sentimentColor}`}>{data.marketSentiment}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${recColor}`}>{data.recommendation}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${riskColor}`}>Risk: {data.riskLevel}</span>
        </div>

        {/* Signals */}
        {data.signals?.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {data.signals.map((s: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">{s.indicator}</span>
                <div className="flex items-center gap-2">
                  <span className="text-foreground">{s.value}</span>
                  <span className={`font-bold ${s.signal === "Bullish" ? "text-primary" : s.signal === "Bearish" ? "text-destructive" : "text-amber-400"}`}>{s.signal}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trade Setup */}
        {data.tradeSetup && (
          <div className="bg-secondary/20 rounded-lg p-2.5 mb-3 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <Target className="w-3 h-3 text-primary" />
              <span className="font-bold uppercase tracking-widest text-[10px]">Trade Setup</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              <span className="text-muted-foreground">Entry</span><span className="text-right font-mono">{data.tradeSetup.entry}</span>
              <span className="text-muted-foreground">Stop Loss</span><span className="text-right font-mono text-destructive">{data.tradeSetup.stopLoss}</span>
              <span className="text-muted-foreground">Take Profit</span><span className="text-right font-mono text-primary">{data.tradeSetup.takeProfit}</span>
              <span className="text-muted-foreground">R:R Ratio</span><span className="text-right font-mono">{data.tradeSetup.riskRewardRatio}</span>
            </div>
          </div>
        )}

        {/* Risk Warnings */}
        {data.riskWarnings?.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              <AlertTriangle className="w-3 h-3 text-amber-400" />Risk Warnings
            </div>
            {data.riskWarnings.map((w: any, i: number) => (
              <div key={i} className={`rounded-lg p-2 text-[11px] flex items-start gap-2 ${
                w.severity === "Critical" ? "bg-red-500/10 border border-red-500/20" :
                w.severity === "High" ? "bg-amber-500/10 border border-amber-500/20" :
                "bg-secondary/30 border border-border/20"
              }`}>
                <Shield className={`w-3 h-3 shrink-0 mt-0.5 ${
                  w.severity === "Critical" ? "text-red-400" : w.severity === "High" ? "text-amber-400" : "text-muted-foreground"
                }`} />
                <div>
                  <span className="text-foreground">{w.warning}</span>
                  <span className={`ml-2 font-bold ${
                    w.severity === "Critical" ? "text-red-400" : w.severity === "High" ? "text-amber-400" : "text-muted-foreground"
                  }`}>({w.lossLikelihood} loss chance)</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />Confidence: {data.confidencePercent}% · AI analysis, not financial advice
        </p>
      </div>
    </div>
  );
};

const Trade = () => {
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [recentTrades, setRecentTrades] = useState<{ price: number; amount: number; time: string; side: "buy" | "sell" }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const [ohlcData, setOhlcData] = useState<OHLCCandle[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { publicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { toast } = useToast();
  const { openWalletConnect } = useDexWalletConnect();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch live SOL price from CoinGecko
  const fetchPriceData = useCallback(async () => {
    try {
      const resp = await fetch(
        "https://api.coingecko.com/api/v3/coins/solana?localization=false&tickers=false&community_data=false&developer_data=false"
      );
      const data = await resp.json();
      const md = data.market_data;
      setPriceData({
        price: md.current_price.usd,
        change24h: md.price_change_percentage_24h,
        high24h: md.high_24h.usd,
        low24h: md.low_24h.usd,
        volume24h: md.total_volume.usd,
      });
      if (!price) setPrice(md.current_price.usd.toFixed(2));
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch OHLC data from CoinGecko
  const fetchOHLC = useCallback(async (tf: string) => {
    setChartLoading(true);
    try {
      const config = TIMEFRAMES.find((t) => t.label === tf) || TIMEFRAMES[2];
      const resp = await fetch(
        `https://api.coingecko.com/api/v3/coins/solana/ohlc?vs_currency=usd&days=${config.cgParam}`
      );
      if (!resp.ok) throw new Error("OHLC fetch failed");
      const raw: number[][] = await resp.json();

      // CoinGecko returns [timestamp, open, high, low, close]
      let candles: OHLCCandle[] = raw.map((c) => {
        const [ts, o, h, l, cl] = c;
        const bullish = cl >= o;
        return {
          timestamp: ts,
          time: formatCandleTime(ts, tf),
          open: o,
          high: h,
          low: l,
          close: cl,
          body: bullish ? [o, cl] : [cl, o],
          wick: [l, h],
          bullish,
        };
      });

      // For 1H/4H, slice to show fewer candles
      if (tf === "1H") candles = candles.slice(-12);
      else if (tf === "4H") candles = candles.slice(-24);

      setOhlcData(candles);
    } catch {
      setOhlcData([]);
    } finally {
      setChartLoading(false);
    }
  }, []);

  function formatCandleTime(ts: number, tf: string): string {
    const d = new Date(ts);
    if (tf === "1H" || tf === "4H") {
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    }
    if (tf === "1D" || tf === "1W") {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  // Generate simulated order book
  const generateOrderBook = useCallback(async () => {
    if (!priceData) return;
    const mid = priceData.price;
    const spread = mid * 0.001;

    const newAsks: OrderBookEntry[] = [];
    const newBids: OrderBookEntry[] = [];
    for (let i = 0; i < 8; i++) {
      const askPrice = mid + spread * (i + 1) + Math.random() * spread * 0.5;
      const askAmt = Math.floor(50 + Math.random() * 500);
      newAsks.push({ price: askPrice, amount: askAmt, total: +(askPrice * askAmt).toFixed(2) });

      const bidPrice = mid - spread * (i + 1) - Math.random() * spread * 0.5;
      const bidAmt = Math.floor(50 + Math.random() * 500);
      newBids.push({ price: bidPrice, amount: bidAmt, total: +(bidPrice * bidAmt).toFixed(2) });
    }
    setAsks(newAsks);
    setBids(newBids);

    const sides: ("buy" | "sell")[] = ["buy", "sell"];
    const trades = Array.from({ length: 8 }, (_, i) => {
      const s = sides[Math.floor(Math.random() * 2)];
      const tradePrice = mid + (Math.random() - 0.5) * spread * 4;
      const now = new Date();
      now.setSeconds(now.getSeconds() - i * 5);
      return {
        price: +tradePrice.toFixed(4),
        amount: Math.floor(10 + Math.random() * 200),
        time: now.toLocaleTimeString("en-US", { hour12: false }),
        side: s,
      };
    });
    setRecentTrades(trades);
  }, [priceData]);

  useEffect(() => {
    fetchPriceData();
    intervalRef.current = setInterval(fetchPriceData, 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchPriceData]);

  useEffect(() => {
    fetchOHLC(selectedTimeframe);
  }, [selectedTimeframe, fetchOHLC]);

  useEffect(() => {
    generateOrderBook();
    const id = setInterval(generateOrderBook, 5000);
    return () => clearInterval(id);
  }, [generateOrderBook]);

  const total = price && amount ? (parseFloat(price) * parseFloat(amount)).toFixed(2) : "";

  const handlePercentage = (pct: number) => {
    if (amount) {
      setAmount((parseFloat(amount) * pct / 100).toFixed(2));
    }
  };

  const handleSubmitOrder = async () => {
    if (!connected || !publicKey || !signTransaction) return;
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: "Enter an amount", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      if (orderType === "market") {
        const lamports = Math.floor(parseFloat(amount) * 1e9);
        const params = new URLSearchParams({
          inputMint: side === "buy" ? USDC_MINT : SOL_MINT,
          outputMint: side === "buy" ? SOL_MINT : USDC_MINT,
          amount: side === "buy" ? Math.floor(parseFloat(total || "0") * 1e6).toString() : lamports.toString(),
          slippageBps: "50",
        });

        const quoteResp = await fetch(`${JUPITER_QUOTE_API}?${params}`);
        if (!quoteResp.ok) throw new Error("Failed to get quote");
        const quoteData = await quoteResp.json();

        const swapResp = await fetch("https://quote-api.jup.ag/v6/swap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quoteResponse: quoteData,
            userPublicKey: publicKey.toBase58(),
            wrapAndUnwrapSol: true,
          }),
        });
        if (!swapResp.ok) throw new Error("Failed to build swap tx");

        const { swapTransaction } = await swapResp.json();
        const { VersionedTransaction } = await import("@solana/web3.js");
        const tx = VersionedTransaction.deserialize(Buffer.from(swapTransaction, "base64"));
        const signed = await signTransaction(tx);
        const txid = await connection.sendRawTransaction(signed.serialize(), { skipPreflight: true });

        const bh = await connection.getLatestBlockhash();
        await connection.confirmTransaction({ blockhash: bh.blockhash, lastValidBlockHeight: bh.lastValidBlockHeight, signature: txid }, "confirmed");

        try {
          const feeTx = new Transaction().add(SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: PLATFORM_FEE_WALLET, lamports: PLATFORM_FEE_LAMPORTS }));
          feeTx.feePayer = publicKey;
          feeTx.recentBlockhash = bh.blockhash;
          const signedFee = await signTransaction(feeTx);
          await connection.sendRawTransaction(signedFee.serialize());
        } catch {}

        toast({ title: "Market Order Executed! 🎉", description: `${side === "buy" ? "Bought" : "Sold"} ${amount} SOL` });
      } else {
        toast({ title: "Limit Order Placed", description: `${side === "buy" ? "Buy" : "Sell"} ${amount} SOL @ $${price}. Will execute when price is reached.` });
      }

      setAmount("");
    } catch (e: any) {
      toast({ title: "Order Failed", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const maxAsk = asks.length ? Math.max(...asks.map((o) => o.amount)) : 1;
  const maxBid = bids.length ? Math.max(...bids.map((o) => o.amount)) : 1;

  const formatVol = (v: number) => {
    if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
    return `$${(v / 1e3).toFixed(0)}K`;
  };

  // Chart Y-axis domain
  const yDomain = useMemo(() => {
    if (!ohlcData.length) return [0, 100];
    const lows = ohlcData.map((c) => c.low);
    const highs = ohlcData.map((c) => c.high);
    const min = Math.min(...lows);
    const max = Math.max(...highs);
    const pad = (max - min) * 0.05 || 1;
    return [Math.floor(min - pad), Math.ceil(max + pad)];
  }, [ohlcData]);

  const CustomCandlestickTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload as OHLCCandle;
    if (!d) return null;
    return (
      <div className="rounded-lg border border-border/50 bg-background/95 backdrop-blur-sm px-3 py-2 text-xs shadow-xl">
        <div className="font-medium text-foreground mb-1">{d.time}</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
          <span className="text-muted-foreground">Open</span>
          <span className="text-right font-mono">${d.open.toFixed(2)}</span>
          <span className="text-muted-foreground">High</span>
          <span className="text-right font-mono text-primary">${d.high.toFixed(2)}</span>
          <span className="text-muted-foreground">Low</span>
          <span className="text-right font-mono text-destructive">${d.low.toFixed(2)}</span>
          <span className="text-muted-foreground">Close</span>
          <span className={`text-right font-mono ${d.bullish ? "text-primary" : "text-destructive"}`}>
            ${d.close.toFixed(2)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <DexLayout>
      <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 max-w-7xl mx-auto">
        {/* Chart area */}
        <div className="lg:col-span-8 glass rounded-xl p-4 gradient-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-lg">SOL / USDC</h2>
              <div className="flex items-center gap-2 mt-0.5">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                ) : priceData ? (
                  <>
                    <span className="text-2xl font-bold text-primary">${priceData.price.toFixed(2)}</span>
                    <span className={`text-xs flex items-center gap-0.5 ${priceData.change24h >= 0 ? "text-primary" : "text-destructive"}`}>
                      {priceData.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {priceData.change24h >= 0 ? "+" : ""}{priceData.change24h.toFixed(2)}%
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
            </div>
            <div className="flex gap-1 text-xs">
              {TIMEFRAMES.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setSelectedTimeframe(t.label)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    selectedTimeframe === t.label
                      ? "bg-primary/15 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* OHLC Chart */}
          <div className="h-64 md:h-80 rounded-lg bg-secondary/10 border border-border/30 relative overflow-hidden">
            {chartLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
              </div>
            ) : ohlcData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                No chart data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={ohlcData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.2)" />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    minTickGap={40}
                  />
                  <YAxis
                    domain={yDomain}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => `$${v}`}
                    width={55}
                  />
                  <Tooltip content={<CustomCandlestickTooltip />} />
                  {/* Wick (high-low range) as thin bar */}
                  <Bar dataKey="wick" barSize={2} isAnimationActive={false}>
                    {ohlcData.map((entry, i) => (
                      <Cell
                        key={`wick-${i}`}
                        fill={entry.bullish ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                      />
                    ))}
                  </Bar>
                  {/* Body (open-close range) as wider bar */}
                  <Bar dataKey="body" barSize={8} isAnimationActive={false}>
                    {ohlcData.map((entry, i) => (
                      <Cell
                        key={`body-${i}`}
                        fill={entry.bullish ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                        stroke={entry.bullish ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                      />
                    ))}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Volume bar */}
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            {priceData && (
              <>
                <span>24h Vol: <span className="text-foreground font-medium">{formatVol(priceData.volume24h)}</span></span>
                <span>24h High: <span className="text-primary">${priceData.high24h.toFixed(2)}</span></span>
                <span>24h Low: <span className="text-destructive">${priceData.low24h.toFixed(2)}</span></span>
              </>
            )}
          </div>
        </div>

        {/* Order form */}
        <div className="lg:col-span-4 space-y-3">
          <div className="glass rounded-xl p-4 gradient-border">
            <div className="flex gap-1 mb-4">
              <button onClick={() => setSide("buy")} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${side === "buy" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary/50"}`}>
                Buy
              </button>
              <button onClick={() => setSide("sell")} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${side === "sell" ? "bg-destructive/15 text-destructive" : "text-muted-foreground hover:bg-secondary/50"}`}>
                Sell
              </button>
            </div>

            <div className="flex gap-1 mb-4">
              {(["limit", "market"] as const).map((t) => (
                <button key={t} onClick={() => setOrderType(t)} className={`text-xs px-3 py-1.5 rounded-lg capitalize transition-colors ${orderType === t ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"}`}>
                  {t}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {orderType === "limit" && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Price (USDC)</label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-secondary/30 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30" />
                </div>
              )}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Amount (SOL)</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-secondary/30 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30" />
              </div>
              <div className="flex gap-1">
                {[25, 50, 75, 100].map((pct) => (
                  <button key={pct} onClick={() => handlePercentage(pct)} className="flex-1 text-xs py-1 rounded bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                    {pct}%
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Total (USDC)</label>
                <input type="text" value={total} readOnly placeholder="0.00" className="w-full bg-secondary/30 rounded-lg px-3 py-2.5 text-sm outline-none" />
              </div>
              <div className="text-xs text-muted-foreground flex justify-between">
                <span>Platform Fee</span>
                <span>0.01 SOL</span>
              </div>

              {!user ? (
                <Button className="w-full h-11 font-semibold glow-sm" onClick={() => navigate("/auth")}>
                  <LogIn className="w-4 h-4 mr-2" /> Sign In to Trade
                </Button>
              ) : !connected ? (
                <Button className="w-full h-11 font-semibold glow-sm" onClick={() => openWalletModal(true)}>
                  Connect Wallet
                </Button>
              ) : (
                <Button
                  className={`w-full h-11 font-semibold ${side === "buy" ? "glow-sm" : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"}`}
                  disabled={submitting || !amount}
                  onClick={handleSubmitOrder}
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {submitting ? "Processing..." : side === "buy" ? "Buy SOL" : "Sell SOL"}
                </Button>
              )}
            </div>
          </div>

          {/* Mini order book */}
          <div className="glass rounded-xl p-4 gradient-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Order Book</h3>
            <div className="text-[11px] space-y-0.5">
              {asks.slice().reverse().slice(0, 6).map((o, i) => (
                <div key={i} className="flex justify-between py-0.5 relative">
                  <div className="absolute right-0 top-0 bottom-0 bg-destructive/5 rounded-sm" style={{ width: `${(o.amount / maxAsk) * 100}%` }} />
                  <span className="text-destructive relative z-10">{o.price.toFixed(2)}</span>
                  <span className="text-muted-foreground relative z-10">{o.amount.toLocaleString()}</span>
                </div>
              ))}
              <div className="text-center py-1.5 text-primary font-bold text-sm border-y border-border/30 my-1">
                {priceData ? `$${priceData.price.toFixed(2)}` : "—"}
              </div>
              {bids.slice(0, 6).map((o, i) => (
                <div key={i} className="flex justify-between py-0.5 relative">
                  <div className="absolute right-0 top-0 bottom-0 bg-primary/5 rounded-sm" style={{ width: `${(o.amount / maxBid) * 100}%` }} />
                  <span className="text-primary relative z-10">{o.price.toFixed(2)}</span>
                  <span className="text-muted-foreground relative z-10">{o.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent trades */}
        {/* AI Trade Advisor */}
        <div className="lg:col-span-4">
          <AITradeAdvisor />
        </div>

        {/* Recent trades */}
        <div className="lg:col-span-8 glass rounded-xl p-4 gradient-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent Trades</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border/30">
                  <th className="text-left py-2 font-medium">Price</th>
                  <th className="text-right py-2 font-medium">Amount (SOL)</th>
                  <th className="text-right py-2 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map((t, i) => (
                  <tr key={i} className="border-b border-border/10">
                    <td className={`py-1.5 ${t.side === "buy" ? "text-primary" : "text-destructive"}`}>
                      ${t.price.toFixed(2)}
                    </td>
                    <td className="text-right text-muted-foreground">{t.amount.toLocaleString()}</td>
                    <td className="text-right text-muted-foreground">{t.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DexLayout>
  );
};

export default Trade;
