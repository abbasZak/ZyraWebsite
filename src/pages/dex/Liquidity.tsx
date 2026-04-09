import { useState, useEffect } from "react";
import { Droplets, Plus, TrendingUp, Loader2, LogIn, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import DexLayout from "@/components/dex/DexLayout";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Pool {
  pair: string;
  tvl: string;
  apr: string;
  volume24h: string;
  icon1: string;
  icon2: string;
}

const poolsData: Pool[] = [
  { pair: "SOL / USDC", tvl: "$2.4M", apr: "18.5%", volume24h: "$340K", icon1: "◎", icon2: "💲" },
  { pair: "SOL / USDT", tvl: "$1.8M", apr: "22.1%", volume24h: "$280K", icon1: "◎", icon2: "💵" },
  { pair: "SOL / BONK", tvl: "$980K", apr: "25.7%", volume24h: "$120K", icon1: "◎", icon2: "🦴" },
  { pair: "SOL / RAY", tvl: "$1.1M", apr: "19.3%", volume24h: "$190K", icon1: "◎", icon2: "☀️" },
];

interface UserPosition {
  id: string;
  pair: string;
  token_a_amount: number;
  token_b_amount: number;
  lp_tokens: number;
  pool_share: number;
}

const Liquidity = () => {
  const [positions, setPositions] = useState<UserPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingPool, setAddingPool] = useState<string | null>(null);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { toast } = useToast();

  // Fetch user positions
  useEffect(() => {
    if (!user) return;
    const fetchPositions = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("liquidity_positions")
        .select("*")
        .eq("user_id", user.id);
      if (data) setPositions(data);
      setLoading(false);
    };
    fetchPositions();
  }, [user]);

  const handleAddLiquidity = async (pair: string) => {
    if (!user || !connected) return;
    if (!amountA || !amountB || parseFloat(amountA) <= 0 || parseFloat(amountB) <= 0) {
      toast({ title: "Enter valid amounts", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const lpTokens = Math.sqrt(parseFloat(amountA) * parseFloat(amountB));
      const poolShare = Math.random() * 0.5; // Simulated

      const { error } = await supabase.from("liquidity_positions").insert({
        user_id: user.id,
        pair,
        token_a_amount: parseFloat(amountA),
        token_b_amount: parseFloat(amountB),
        lp_tokens: lpTokens,
        pool_share: poolShare,
      });

      if (error) throw error;

      toast({ title: "Liquidity Added! 🎉", description: `Added ${amountA} + ${amountB} to ${pair}` });

      // Refresh
      const { data } = await supabase.from("liquidity_positions").select("*").eq("user_id", user.id);
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

  const handleRemoveLiquidity = async (posId: string) => {
    if (!user) return;
    const { error } = await supabase.from("liquidity_positions").delete().eq("id", posId).eq("user_id", user.id);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      return;
    }
    setPositions((prev) => prev.filter((p) => p.id !== posId));
    toast({ title: "Liquidity Removed" });
  };

  const getUserLiquidity = (pair: string) => {
    const pos = positions.filter((p) => p.pair === pair);
    if (!pos.length) return "$0.00";
    const total = pos.reduce((s, p) => s + p.token_a_amount + p.token_b_amount, 0);
    return `$${total.toFixed(2)}`;
  };

  return (
    <DexLayout>
      <div className="p-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-display font-bold">Liquidity Pools</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Provide liquidity and earn trading fees</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total TVL", value: "$6.28M", icon: Droplets },
            { label: "24h Volume", value: "$930K", icon: TrendingUp },
            { label: "Total Pools", value: String(poolsData.length), icon: Droplets },
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
              {positions.map((pos) => (
                <div key={pos.id} className="glass rounded-xl p-4 gradient-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{pos.pair}</p>
                      <p className="text-xs text-muted-foreground">
                        {pos.token_a_amount.toFixed(4)} + {pos.token_b_amount.toFixed(4)} · LP: {pos.lp_tokens.toFixed(4)} · Share: {(pos.pool_share * 100).toFixed(2)}%
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs border-destructive/20 hover:bg-destructive/10 text-destructive" onClick={() => handleRemoveLiquidity(pos.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pool list */}
        <div className="space-y-2">
          {poolsData.map((pool) => (
            <div key={pool.pair} className="glass rounded-xl gradient-border">
              <div className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-1 text-lg">
                      <span>{pool.icon1}</span>
                      <span>{pool.icon2}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{pool.pair}</p>
                      <p className="text-xs text-muted-foreground">AMM · 0.3% fee</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <p className="text-muted-foreground">TVL</p>
                      <p className="font-medium">{pool.tvl}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">APR</p>
                      <p className="font-medium text-primary">{pool.apr}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">24h Vol</p>
                      <p className="font-medium">{pool.volume24h}</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-muted-foreground">My Liquidity</p>
                      <p className="font-medium">{getUserLiquidity(pool.pair)}</p>
                    </div>
                  </div>
                  {!user ? (
                    <Button variant="outline" size="sm" className="text-xs shrink-0 border-primary/20" onClick={() => navigate("/auth")}>
                      <LogIn className="w-3 h-3 mr-1" /> Sign In
                    </Button>
                  ) : !connected ? (
                    <Button variant="outline" size="sm" className="text-xs shrink-0 border-primary/20" onClick={() => setVisible(true)}>
                      Connect Wallet
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary/20 hover:border-primary/40 text-xs shrink-0"
                      onClick={() => setAddingPool(addingPool === pool.pair ? null : pool.pair)}
                    >
                      {addingPool === pool.pair ? <X className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                      {addingPool === pool.pair ? "Cancel" : "Add Liquidity"}
                    </Button>
                  )}
                </div>
              </div>

              {/* Add liquidity form */}
              {addingPool === pool.pair && (
                <div className="border-t border-border/30 p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">{pool.pair.split(" / ")[0]} Amount</label>
                      <input type="number" value={amountA} onChange={(e) => setAmountA(e.target.value)} placeholder="0.00" className="w-full bg-secondary/30 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/30" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">{pool.pair.split(" / ")[1]} Amount</label>
                      <input type="number" value={amountB} onChange={(e) => setAmountB(e.target.value)} placeholder="0.00" className="w-full bg-secondary/30 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/30" />
                    </div>
                  </div>
                  <Button className="w-full glow-sm" size="sm" disabled={submitting} onClick={() => handleAddLiquidity(pool.pair)}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {submitting ? "Adding..." : "Confirm Add Liquidity"}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DexLayout>
  );
};

export default Liquidity;
