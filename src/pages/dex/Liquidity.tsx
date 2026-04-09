import { useState, useEffect, useCallback } from "react";
import { Droplets, Plus, TrendingUp, Loader2, LogIn, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import DexLayout from "@/components/dex/DexLayout";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/* ── Token registry ────────────────────────────────────── */
const TOKENS: Record<string, { symbol: string; mint: string; decimals: number; icon: string; cgId?: string }> = {
  SOL:  { symbol: "SOL",  mint: "So11111111111111111111111111111111111111112", decimals: 9, icon: "◎", cgId: "solana" },
  USDC: { symbol: "USDC", mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6, icon: "💲", cgId: "usd-coin" },
  USDT: { symbol: "USDT", mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", decimals: 6, icon: "💵", cgId: "tether" },
  BONK: { symbol: "BONK", mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", decimals: 5, icon: "🦴", cgId: "bonk" },
  RAY:  { symbol: "RAY",  mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", decimals: 6, icon: "☀️",  cgId: "raydium" },
};

const POOL_PAIRS = [
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
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { toast } = useToast();

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
      // USDC/USDT are stablecoins, always $1
      prices["USDC"] = prices["USDC"] || 1;
      prices["USDT"] = prices["USDT"] || 1;
      return prices;
    } catch {
      return { SOL: 84, USDC: 1, USDT: 1, BONK: 0.000015, RAY: 2.5 };
    }
  }, []);

  /* ── Fetch pool data from Raydium API ────────────────── */
  const fetchPoolData = useCallback(async () => {
    setRefreshing(true);
    try {
      const prices = await fetchPrices();

      // Fetch Raydium pool list for our pairs
      const raydiumPools: LivePool[] = [];

      for (const pair of POOL_PAIRS) {
        const tA = TOKENS[pair.a];
        const tB = TOKENS[pair.b];
        try {
          const res = await fetch(
            `https://api-v3.raydium.io/pools/info/mint?mint1=${tA.mint}&mint2=${tB.mint}&poolType=standard&poolSortField=liquidity&sortType=desc&pageSize=1&page=1`
          );
          const json = await res.json();
          const pool = json?.data?.data?.[0];

          if (pool) {
            raydiumPools.push({
              pair: `${pair.a} / ${pair.b}`,
              tokenA: pair.a,
              tokenB: pair.b,
              tvl: pool.tvl || 0,
              apr: (pool.day?.apr ?? pool.week?.apr ?? 0) * 100,
              volume24h: pool.day?.volume ?? 0,
              priceA: prices[pair.a] || 0,
              priceB: prices[pair.b] || 0,
              iconA: tA.icon,
              iconB: tB.icon,
            });
          } else {
            // Fallback: estimate from prices
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
    setAmountA(val);
    if (val && pool.priceA && pool.priceB) {
      const usdVal = parseFloat(val) * pool.priceA;
      setAmountB((usdVal / pool.priceB).toFixed(6));
    } else {
      setAmountB("");
    }
  };

  const handleAmountBChange = (val: string, pool: LivePool) => {
    setAmountB(val);
    if (val && pool.priceA && pool.priceB) {
      const usdVal = parseFloat(val) * pool.priceB;
      setAmountA((usdVal / pool.priceA).toFixed(6));
    } else {
      setAmountA("");
    }
  };

  /* ── Fetch user positions ────────────────────────────── */
  useEffect(() => {
    fetchPoolData();
    const interval = setInterval(fetchPoolData, 60_000); // refresh every minute
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
    const a = parseFloat(amountA);
    const b = parseFloat(amountB);
    if (!a || !b || a <= 0 || b <= 0) {
      toast({ title: "Enter valid amounts", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      // Calculate LP tokens using constant-product formula: sqrt(a * b)
      const lpTokens = Math.sqrt(a * b);
      // Pool share = user's USD value / total TVL
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

      // Refresh positions
      const { data } = await supabase
        .from("liquidity_positions")
        .select("*")
        .eq("user_id", user.id);
      if (data) setPositions(data);

      setAmountA("");
      setAmountB("");
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
    const { error } = await supabase
      .from("liquidity_positions")
      .delete()
      .eq("id", posId)
      .eq("user_id", user.id);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      return;
    }
    setPositions((prev) => prev.filter((p) => p.id !== posId));
    toast({ title: "Liquidity Removed" });
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

  return (
    <DexLayout>
      <div className="p-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-display font-bold">Liquidity Pools</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Provide liquidity and earn trading fees · Live data from Raydium
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={fetchPoolData}
            disabled={refreshing}
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total TVL", value: loading ? "..." : fmt(totalTvl), icon: Droplets },
            { label: "24h Volume", value: loading ? "..." : fmt(totalVolume), icon: TrendingUp },
            { label: "Active Pools", value: String(pools.length), icon: Droplets },
            { label: "My Positions", value: String(positions.length), icon: Plus },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl p-3 gradient-border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <s.icon className="w-3 h-3" />
                {s.label}
              </div>
              <p className="text-lg font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* My positions */}
        {positions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold mb-3">My Positions</h2>
            <div className="space-y-2">
              {positions.map((pos) => {
                const pool = pools.find((p) => p.pair === pos.pair);
                const usdValue = pool
                  ? pos.token_a_amount * pool.priceA + pos.token_b_amount * pool.priceB
                  : 0;
                return (
                  <div key={pos.id} className="glass rounded-xl p-4 gradient-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">{pos.pair}</p>
                        <p className="text-xs text-muted-foreground">
                          {pos.token_a_amount.toFixed(4)} + {pos.token_b_amount.toFixed(4)} · LP:{" "}
                          {pos.lp_tokens.toFixed(4)} · Share: {(pos.pool_share * 100).toFixed(2)}%
                        </p>
                        {usdValue > 0 && (
                          <p className="text-xs text-primary mt-0.5">≈ {fmt(usdValue)}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs border-destructive/20 hover:bg-destructive/10 text-destructive"
                        onClick={() => handleRemoveLiquidity(pos.id)}
                      >
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
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Loading live pool data...</span>
          </div>
        )}

        {/* Pool list */}
        {!loading && (
          <div className="space-y-2">
            {pools.map((pool) => {
              const myLiq = getUserLiquidityUsd(pool.pair);
              return (
                <div key={pool.pair} className="glass rounded-xl gradient-border">
                  <div className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-1 text-lg">
                          <span>{pool.iconA}</span>
                          <span>{pool.iconB}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{pool.pair}</p>
                          <p className="text-xs text-muted-foreground">Raydium AMM · 0.25% fee</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 text-xs">
                        <div>
                          <p className="text-muted-foreground">TVL</p>
                          <p className="font-medium">{pool.tvl > 0 ? fmt(pool.tvl) : "—"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">APR</p>
                          <p className="font-medium text-primary">
                            {pool.apr > 0 ? `${pool.apr.toFixed(1)}%` : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">24h Vol</p>
                          <p className="font-medium">
                            {pool.volume24h > 0 ? fmt(pool.volume24h) : "—"}
                          </p>
                        </div>
                        <div className="hidden sm:block">
                          <p className="text-muted-foreground">My Liquidity</p>
                          <p className="font-medium">{myLiq > 0 ? fmt(myLiq) : "$0.00"}</p>
                        </div>
                      </div>
                      {!user ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs shrink-0 border-primary/20"
                          onClick={() => navigate("/auth")}
                        >
                          <LogIn className="w-3 h-3 mr-1" /> Sign In
                        </Button>
                      ) : !connected ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs shrink-0 border-primary/20"
                          onClick={() => setVisible(true)}
                        >
                          Connect Wallet
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-primary/20 hover:border-primary/40 text-xs shrink-0"
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

                  {/* Add liquidity form */}
                  {addingPool === pool.pair && (
                    <div className="border-t border-border/30 p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                      {/* Price info */}
                      <div className="text-xs text-muted-foreground bg-secondary/20 rounded-lg p-2">
                        1 {pool.tokenA} ≈ {pool.priceB > 0 ? (pool.priceA / pool.priceB).toFixed(
                          pool.priceB >= 1 ? 2 : 6
                        ) : "?"}{" "}
                        {pool.tokenB} · Amounts are auto-balanced by market price
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">
                            {pool.tokenA} Amount
                          </label>
                          <input
                            type="number"
                            value={amountA}
                            onChange={(e) => handleAmountAChange(e.target.value, pool)}
                            placeholder="0.00"
                            className="w-full bg-secondary/30 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/30"
                          />
                          {amountA && pool.priceA > 0 && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              ≈ ${(parseFloat(amountA) * pool.priceA).toFixed(2)}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">
                            {pool.tokenB} Amount
                          </label>
                          <input
                            type="number"
                            value={amountB}
                            onChange={(e) => handleAmountBChange(e.target.value, pool)}
                            placeholder="0.00"
                            className="w-full bg-secondary/30 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/30"
                          />
                          {amountB && pool.priceB > 0 && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              ≈ ${(parseFloat(amountB) * pool.priceB).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Summary */}
                      {amountA && amountB && (
                        <div className="text-xs bg-secondary/20 rounded-lg p-2 space-y-0.5">
                          <p>
                            LP Tokens:{" "}
                            <span className="font-medium">
                              {Math.sqrt(parseFloat(amountA) * parseFloat(amountB)).toFixed(6)}
                            </span>
                          </p>
                          <p>
                            Est. Pool Share:{" "}
                            <span className="font-medium">
                              {pool.tvl > 0
                                ? (
                                    ((parseFloat(amountA) * pool.priceA +
                                      parseFloat(amountB) * pool.priceB) /
                                      (pool.tvl +
                                        parseFloat(amountA) * pool.priceA +
                                        parseFloat(amountB) * pool.priceB)) *
                                    100
                                  ).toFixed(4)
                                : "100.00"}
                              %
                            </span>
                          </p>
                          <p>
                            Total Value:{" "}
                            <span className="font-medium">
                              $
                              {(
                                parseFloat(amountA) * pool.priceA +
                                parseFloat(amountB) * pool.priceB
                              ).toFixed(2)}
                            </span>
                          </p>
                        </div>
                      )}
                      <Button
                        className="w-full glow-sm"
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
