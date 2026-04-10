import { useState, useEffect, useCallback } from "react";
import { Droplets, Plus, TrendingUp, Loader2, LogIn, X, RefreshCw, ArrowRight, Wallet, BarChart3, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import DexLayout from "@/components/dex/DexLayout";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

/* ── Token registry ────────────────────────────────────── */
const TOKENS: Record<string, { symbol: string; mint: string; decimals: number; icon: string; cgId?: string }> = {
  ZRA:  { symbol: "ZRA",  mint: "3Jz9qH8kB8EyJJu8W1Mj5AS4GX54xJFfcnNNuWZ35bZE", decimals: 9, icon: "💎" },
  SOL:  { symbol: "SOL",  mint: "So11111111111111111111111111111111111111112", decimals: 9, icon: "◎", cgId: "solana" },
  USDC: { symbol: "USDC", mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6, icon: "💲", cgId: "usd-coin" },
  USDT: { symbol: "USDT", mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", decimals: 6, icon: "💵", cgId: "tether" },
  BONK: { symbol: "BONK", mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", decimals: 5, icon: "🦴", cgId: "bonk" },
  RAY:  { symbol: "RAY",  mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", decimals: 6, icon: "☀️",  cgId: "raydium" },
};

const POOL_PAIRS = [
  { a: "ZRA", b: "USDC" },
  { a: "ZRA", b: "SOL" },
  { a: "SOL", b: "USDC" },
  { a: "SOL", b: "USDT" },
  { a: "SOL", b: "BONK" },
  { a: "SOL", b: "RAY" },
];

/* ── Types ─────────────────────────────────────────────── */
interface LivePool {
  pair: string;
  tokenA: string;
  tokenB: string;
  tvl: number;
  apr: number;
  volume24h: number;
  priceA: number;
  priceB: number;
  iconA: string;
  iconB: string;
}

interface UserPosition {
  id: string;
  pair: string;
  token_a_amount: number;
  token_b_amount: number;
  lp_tokens: number;
  pool_share: number;
}

/* ── Per-pool form state ── */
interface PoolFormState {
  amountA: string;
  amountB: string;
}

/* ── Helpers ───────────────────────────────────────────── */
const fmt = (n: number, prefix = "$") => {
  if (n >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${prefix}${(n / 1_000).toFixed(1)}K`;
  return `${prefix}${n.toFixed(2)}`;
};

/* ── Component ─────────────────────────────────────────── */
const Liquidity = () => {
  const [pools, setPools] = useState<LivePool[]>([]);
  const [positions, setPositions] = useState<UserPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addingPool, setAddingPool] = useState<string | null>(null);
  const [formStates, setFormStates] = useState<Record<string, PoolFormState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "zra" | "sol">("all");

  const { user } = useAuth();
  const navigate = useNavigate();
  const { connected } = useWallet();
  const { toast } = useToast();
  const { setVisible: openWalletModal } = useWalletModal();

  const getFormState = (pair: string): PoolFormState => formStates[pair] || { amountA: "", amountB: "" };
  
  const updateFormState = (pair: string, field: "amountA" | "amountB", value: string) => {
    setFormStates(prev => ({
      ...prev,
      [pair]: { ...getFormState(pair), [field]: value },
    }));
  };

  /* ── Fetch live prices from CoinGecko ────────────────── */
  const fetchPrices = useCallback(async (): Promise<Record<string, number>> => {
    const ids = Object.values(TOKENS)
      .filter((t) => t.cgId)
      .map((t) => t.cgId)
      .join(",");
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currency=usd`
      );
      const data = await res.json();
      const prices: Record<string, number> = {};
      for (const t of Object.values(TOKENS)) {
        if (t.cgId && data[t.cgId]) {
          prices[t.symbol] = data[t.cgId].usd;
        }
      }
      prices["USDC"] = prices["USDC"] || 1;
      prices["USDT"] = prices["USDT"] || 1;
      prices["ZRA"] = 0.045; // Simulated ZRA price
      return prices;
    } catch {
      return { SOL: 170, USDC: 1, USDT: 1, BONK: 0.000015, RAY: 2.5, ZRA: 0.045 };
    }
  }, []);

  /* ── Fetch pool data from Raydium API ────────────────── */
  const fetchPoolData = useCallback(async () => {
    setRefreshing(true);
    try {
      const prices = await fetchPrices();
      const raydiumPools: LivePool[] = [];

      for (const pair of POOL_PAIRS) {
        const tA = TOKENS[pair.a];
        const tB = TOKENS[pair.b];
        
        // ZRA pools are simulated
        if (pair.a === "ZRA" || pair.b === "ZRA") {
          const zraApr = pair.b === "USDC" ? 42.5 : 38.2;
          const zraTvl = pair.b === "USDC" ? 1_250_000 : 850_000;
          const zraVol = pair.b === "USDC" ? 320_000 : 180_000;
          raydiumPools.push({
            pair: `${pair.a} / ${pair.b}`,
            tokenA: pair.a,
            tokenB: pair.b,
            tvl: zraTvl,
            apr: zraApr,
            volume24h: zraVol,
            priceA: prices[pair.a] || 0,
            priceB: prices[pair.b] || 0,
            iconA: tA.icon,
            iconB: tB.icon,
          });
          continue;
        }

        try {
          const res = await fetch(
            `https://api-v3.raydium.io/pools/info/mint?mint1=${tA.mint}&mint2=${tB.mint}&poolType=standard&poolSortField=liquidity&sortType=desc&pageSize=1&page=1`
          );
          const json = await res.json();
          const pool = json?.data?.data?.[0];

          raydiumPools.push({
            pair: `${pair.a} / ${pair.b}`,
            tokenA: pair.a,
            tokenB: pair.b,
            tvl: pool?.tvl || 0,
            apr: pool ? (pool.day?.apr ?? pool.week?.apr ?? 0) * 100 : 0,
            volume24h: pool?.day?.volume ?? 0,
            priceA: prices[pair.a] || 0,
            priceB: prices[pair.b] || 0,
            iconA: tA.icon,
            iconB: tB.icon,
          });
        } catch {
          raydiumPools.push({
            pair: `${pair.a} / ${pair.b}`,
            tokenA: pair.a,
            tokenB: pair.b,
            tvl: 0,
            apr: 0,
            volume24h: 0,
            priceA: prices[pair.a] || 0,
            priceB: prices[pair.b] || 0,
            iconA: tA.icon,
            iconB: tB.icon,
          });
        }
      }

      setPools(raydiumPools);
    } catch (e) {
      console.error("Failed to fetch pool data:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchPrices]);

  /* ── Auto-calculate paired amount based on pool ratio ── */
  const handleAmountAChange = (val: string, pool: LivePool) => {
    updateFormState(pool.pair, "amountA", val);
    if (val && pool.priceA && pool.priceB) {
      const usdVal = parseFloat(val) * pool.priceA;
      updateFormState(pool.pair, "amountB", (usdVal / pool.priceB).toFixed(6));
    } else {
      updateFormState(pool.pair, "amountB", "");
    }
  };

  const handleAmountBChange = (val: string, pool: LivePool) => {
    updateFormState(pool.pair, "amountB", val);
    if (val && pool.priceA && pool.priceB) {
      const usdVal = parseFloat(val) * pool.priceB;
      updateFormState(pool.pair, "amountA", (usdVal / pool.priceA).toFixed(6));
    } else {
      updateFormState(pool.pair, "amountA", "");
    }
  };

  /* ── Fetch on mount ────────────────────────────────────── */
  useEffect(() => {
    fetchPoolData();
    const interval = setInterval(fetchPoolData, 60_000);
    return () => clearInterval(interval);
  }, [fetchPoolData]);

  useEffect(() => {
    if (!user) return;
    const fetchPositions = async () => {
      const { data } = await supabase
        .from("liquidity_positions")
        .select("*")
        .eq("user_id", user.id);
      if (data) setPositions(data);
    };
    fetchPositions();
  }, [user]);

  /* ── Add liquidity ───────────────────────────────────── */
  const handleAddLiquidity = async (pool: LivePool) => {
    if (!user || !connected) return;
    const form = getFormState(pool.pair);
    const a = parseFloat(form.amountA);
    const b = parseFloat(form.amountB);
    if (!a || !b || a <= 0 || b <= 0) {
      toast({ title: "Enter valid amounts", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const lpTokens = Math.sqrt(a * b);
      const userUsd = a * pool.priceA + b * pool.priceB;
      const poolShare = pool.tvl > 0 ? (userUsd / (pool.tvl + userUsd)) : 1;

      const { error } = await supabase.from("liquidity_positions").insert({
        user_id: user.id,
        pair: pool.pair,
        token_a_amount: a,
        token_b_amount: b,
        lp_tokens: lpTokens,
        pool_share: poolShare,
      });

      if (error) throw error;

      toast({
        title: "Liquidity Added! 🎉",
        description: `${a.toFixed(4)} ${pool.tokenA} + ${b.toFixed(4)} ${pool.tokenB} → ${lpTokens.toFixed(4)} LP tokens`,
      });

      const { data } = await supabase
        .from("liquidity_positions")
        .select("*")
        .eq("user_id", user.id);
      if (data) setPositions(data);

      setFormStates(prev => ({ ...prev, [pool.pair]: { amountA: "", amountB: "" } }));
      setAddingPool(null);
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Remove liquidity ────────────────────────────────── */
  const handleRemoveLiquidity = async (posId: string) => {
    if (!user) return;
    setRemovingId(posId);
    const { error } = await supabase
      .from("liquidity_positions")
      .delete()
      .eq("id", posId)
      .eq("user_id", user.id);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      setRemovingId(null);
      return;
    }
    setPositions((prev) => prev.filter((p) => p.id !== posId));
    toast({ title: "Liquidity Removed ✅" });
    setRemovingId(null);
  };

  /* ── Calculate user's liquidity value in USD ─────────── */
  const getUserLiquidityUsd = (pair: string) => {
    const pos = positions.filter((p) => p.pair === pair);
    if (!pos.length) return 0;
    const pool = pools.find((p) => p.pair === pair);
    if (!pool) return 0;
    return pos.reduce(
      (s, p) => s + p.token_a_amount * pool.priceA + p.token_b_amount * pool.priceB,
      0
    );
  };

  /* ── Aggregate stats ─────────────────────────────────── */
  const totalTvl = pools.reduce((s, p) => s + p.tvl, 0);
  const totalVolume = pools.reduce((s, p) => s + p.volume24h, 0);
  const totalUserLiquidity = pools.reduce((s, p) => s + getUserLiquidityUsd(p.pair), 0);

  /* ── Filter pools ── */
  const filteredPools = pools.filter(p => {
    if (filter === "zra") return p.tokenA === "ZRA" || p.tokenB === "ZRA";
    if (filter === "sol") return (p.tokenA === "SOL" || p.tokenB === "SOL") && p.tokenA !== "ZRA" && p.tokenB !== "ZRA";
    return true;
  });

  return (
    <DexLayout>
      <div className="p-4 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-display font-bold flex items-center gap-2">
              Liquidity Pools
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">
                {pools.length} pools
              </span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Provide liquidity and earn trading fees · Live data from Raydium
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs rounded-xl gap-1.5"
            onClick={fetchPoolData}
            disabled={refreshing}
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total TVL", value: loading ? "..." : fmt(totalTvl), icon: Droplets, color: "text-blue-400" },
            { label: "24h Volume", value: loading ? "..." : fmt(totalVolume), icon: BarChart3, color: "text-primary" },
            { label: "Active Pools", value: String(pools.length), icon: Zap, color: "text-amber-400" },
            { label: "My Liquidity", value: totalUserLiquidity > 0 ? fmt(totalUserLiquidity) : "$0.00", icon: Wallet, color: "text-violet-400" },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl p-4 gradient-border hover:bg-secondary/10 transition-colors">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                {s.label}
              </div>
              <p className="text-lg font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 mb-4">
          {([["all", "All Pools"], ["zra", "ZRA Pools"], ["sol", "SOL Pools"]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === key
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* My positions */}
        {positions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5 text-primary" />My Positions
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">{positions.length}</span>
            </h2>
            <div className="space-y-2">
              {positions.map((pos) => {
                const pool = pools.find((p) => p.pair === pos.pair);
                const usdValue = pool
                  ? pos.token_a_amount * pool.priceA + pos.token_b_amount * pool.priceB
                  : 0;
                const isRemoving = removingId === pos.id;
                return (
                  <div key={pos.id} className="glass rounded-xl p-4 gradient-border hover:bg-secondary/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">{pos.pair}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {pos.token_a_amount.toFixed(4)} + {pos.token_b_amount.toFixed(4)} · LP:{" "}
                          {pos.lp_tokens.toFixed(4)} · Share: {(pos.pool_share * 100).toFixed(2)}%
                        </p>
                        {usdValue > 0 && (
                          <p className="text-xs text-primary font-semibold mt-0.5">≈ {fmt(usdValue)}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs border-destructive/20 hover:bg-destructive/10 text-destructive rounded-lg"
                        onClick={() => handleRemoveLiquidity(pos.id)}
                        disabled={isRemoving}
                      >
                        {isRemoving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading live pool data...</span>
          </div>
        )}

        {/* Pool list */}
        {!loading && (
          <div className="space-y-2">
            {filteredPools.map((pool) => {
              const myLiq = getUserLiquidityUsd(pool.pair);
              const form = getFormState(pool.pair);
              const isZraPool = pool.tokenA === "ZRA" || pool.tokenB === "ZRA";
              return (
                <div key={pool.pair} className={`glass rounded-xl gradient-border ${isZraPool ? "ring-1 ring-primary/10" : ""}`}>
                  <div className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-1 text-lg">
                          <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm">{pool.iconA}</span>
                          <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm -ml-2 border-2 border-background">{pool.iconB}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm">{pool.pair}</p>
                            {isZraPool && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-bold border border-primary/20">Featured</span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground">{isZraPool ? "Zyra AMM" : "Raydium AMM"} · 0.25% fee</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 text-xs">
                        <div>
                          <p className="text-muted-foreground text-[10px]">TVL</p>
                          <p className="font-bold">{pool.tvl > 0 ? fmt(pool.tvl) : "—"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-[10px]">APR</p>
                          <p className="font-bold text-primary">
                            {pool.apr > 0 ? `${pool.apr.toFixed(1)}%` : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-[10px]">24h Vol</p>
                          <p className="font-bold">
                            {pool.volume24h > 0 ? fmt(pool.volume24h) : "—"}
                          </p>
                        </div>
                        <div className="hidden sm:block">
                          <p className="text-muted-foreground text-[10px]">My Liquidity</p>
                          <p className="font-bold">{myLiq > 0 ? fmt(myLiq) : "$0.00"}</p>
                        </div>
                      </div>
                      {!user ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs shrink-0 border-primary/20 rounded-lg"
                          onClick={() => navigate("/auth")}
                        >
                          <LogIn className="w-3 h-3 mr-1" /> Sign In
                        </Button>
                      ) : !connected ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs shrink-0 border-primary/20 rounded-lg"
                          onClick={() => void openWalletConnect()}
                        >
                          Connect Wallet
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-primary/20 hover:border-primary/40 text-xs shrink-0 rounded-lg"
                          onClick={() =>
                            setAddingPool(addingPool === pool.pair ? null : pool.pair)
                          }
                        >
                          {addingPool === pool.pair ? (
                            <X className="w-3 h-3 mr-1" />
                          ) : (
                            <Plus className="w-3 h-3 mr-1" />
                          )}
                          {addingPool === pool.pair ? "Cancel" : "Add Liquidity"}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Add liquidity form - per pool isolated state */}
                  {addingPool === pool.pair && (
                    <div className="border-t border-border/30 p-4 space-y-3 animate-in slide-in-from-top-2 duration-200 bg-secondary/5">
                      {/* Price info */}
                      <div className="text-xs text-muted-foreground bg-secondary/30 rounded-lg p-2.5 flex items-center gap-2">
                        <ArrowRight className="w-3 h-3 text-primary shrink-0" />
                        1 {pool.tokenA} ≈ {pool.priceB > 0 ? (pool.priceA / pool.priceB).toFixed(
                          pool.priceB >= 1 ? 2 : 6
                        ) : "?"}{" "}
                        {pool.tokenB} · Auto-balanced by market price
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1.5 block font-semibold">
                            {pool.tokenA} Amount
                          </label>
                          <input
                            type="number"
                            value={form.amountA}
                            onChange={(e) => handleAmountAChange(e.target.value, pool)}
                            placeholder="0.00"
                            className="w-full bg-secondary/30 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all border border-border/30 focus:border-primary/30"
                          />
                          {form.amountA && pool.priceA > 0 && (
                            <p className="text-[10px] text-muted-foreground mt-1">
                              ≈ ${(parseFloat(form.amountA) * pool.priceA).toFixed(2)}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1.5 block font-semibold">
                            {pool.tokenB} Amount
                          </label>
                          <input
                            type="number"
                            value={form.amountB}
                            onChange={(e) => handleAmountBChange(e.target.value, pool)}
                            placeholder="0.00"
                            className="w-full bg-secondary/30 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all border border-border/30 focus:border-primary/30"
                          />
                          {form.amountB && pool.priceB > 0 && (
                            <p className="text-[10px] text-muted-foreground mt-1">
                              ≈ ${(parseFloat(form.amountB) * pool.priceB).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Summary */}
                      {form.amountA && form.amountB && parseFloat(form.amountA) > 0 && parseFloat(form.amountB) > 0 && (
                        <div className="text-xs bg-secondary/30 rounded-lg p-3 space-y-1 border border-border/20">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">LP Tokens</span>
                            <span className="font-bold">
                              {Math.sqrt(parseFloat(form.amountA) * parseFloat(form.amountB)).toFixed(6)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Est. Pool Share</span>
                            <span className="font-bold">
                              {pool.tvl > 0
                                ? (
                                    ((parseFloat(form.amountA) * pool.priceA +
                                      parseFloat(form.amountB) * pool.priceB) /
                                      (pool.tvl +
                                        parseFloat(form.amountA) * pool.priceA +
                                        parseFloat(form.amountB) * pool.priceB)) *
                                    100
                                  ).toFixed(4)
                                : "100.00"}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Value</span>
                            <span className="font-bold text-primary">
                              ${(
                                parseFloat(form.amountA) * pool.priceA +
                                parseFloat(form.amountB) * pool.priceB
                              ).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                      <Button
                        className="w-full glow-sm rounded-xl"
                        size="sm"
                        disabled={submitting}
                        onClick={() => handleAddLiquidity(pool)}
                      >
                        {submitting ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        {submitting ? "Adding..." : "Confirm Add Liquidity"}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DexLayout>
  );
};

export default Liquidity;
