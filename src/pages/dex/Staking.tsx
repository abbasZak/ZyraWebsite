import { useState, useEffect } from "react";
import { Coins, Lock, Clock, TrendingUp, Loader2, LogIn, Sparkles, Shield, Zap, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import DexLayout from "@/components/dex/DexLayout";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const stakingTiers = [
  { duration: 30, label: "30 Days", apr: 8, minStake: 1000, lockIcon: "🔓", color: "from-emerald-500/20 to-emerald-500/5", borderColor: "border-emerald-500/20" },
  { duration: 90, label: "90 Days", apr: 15, minStake: 5000, lockIcon: "🔒", color: "from-blue-500/20 to-blue-500/5", borderColor: "border-blue-500/20" },
  { duration: 180, label: "180 Days", apr: 25, minStake: 10000, lockIcon: "🔐", color: "from-violet-500/20 to-violet-500/5", borderColor: "border-violet-500/20" },
  { duration: 365, label: "365 Days", apr: 40, minStake: 25000, lockIcon: "🏆", color: "from-amber-500/20 to-amber-500/5", borderColor: "border-amber-500/20" },
];

interface Stake {
  id: string;
  amount: number;
  duration_days: number;
  apr: number;
  start_date: string;
  end_date: string;
  rewards_earned: number;
  status: string;
}

const Staking = () => {
  const [stakes, setStakes] = useState<Stake[]>([]);
  const [amounts, setAmounts] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [submittingTier, setSubmittingTier] = useState<number | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    const fetchStakes = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("stakes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setStakes(data);
      setLoading(false);
    };
    fetchStakes();
  }, [user]);

  const handleStake = async (tier: typeof stakingTiers[0]) => {
    if (!user || !connected) return;
    const amt = parseFloat(amounts[tier.duration] || "0");
    if (amt < tier.minStake) {
      toast({ title: `Minimum stake is ${tier.minStake.toLocaleString()} ZRA`, variant: "destructive" });
      return;
    }

    setSubmittingTier(tier.duration);
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + tier.duration);

      const { error } = await supabase.from("stakes").insert({
        user_id: user.id,
        amount: amt,
        duration_days: tier.duration,
        apr: tier.apr,
        end_date: endDate.toISOString(),
        rewards_earned: 0,
        status: "active",
      });

      if (error) throw error;

      toast({ title: "Staked Successfully! 🎉", description: `${amt.toLocaleString()} ZRA locked for ${tier.label} at ${tier.apr}% APR` });

      const { data } = await supabase.from("stakes").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (data) setStakes(data);
      setAmounts((prev) => ({ ...prev, [tier.duration]: "" }));
    } catch (e: any) {
      toast({ title: "Staking Failed", description: e.message, variant: "destructive" });
    } finally {
      setSubmittingTier(null);
    }
  };

  const totalStaked = stakes.filter((s) => s.status === "active").reduce((sum, s) => sum + s.amount, 0);
  const totalRewards = stakes.reduce((sum, s) => sum + s.rewards_earned, 0);
  const activeStakes = stakes.filter((s) => s.status === "active").length;

  const calcEstRewards = (amt: string, apr: number, days: number) => {
    const a = parseFloat(amt || "0");
    if (a <= 0) return "0";
    return ((a * apr / 100) * (days / 365)).toFixed(2);
  };

  return (
    <DexLayout>
      <div className="p-4 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 relative">
          <div className="absolute inset-0 -top-4 bg-gradient-to-b from-primary/5 via-transparent to-transparent rounded-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center glow-sm">
                <Coins className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold">Stake ZRA</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Lock your tokens to earn rewards</p>
              </div>
            </div>
          </div>
        </div>

        {/* Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Staked", value: totalStaked > 0 ? `${totalStaked.toLocaleString()} ZRA` : "0 ZRA", icon: Coins, color: "text-primary" },
            { label: "Active Stakes", value: String(activeStakes), icon: Shield, color: "text-blue-400" },
            { label: "Total Rewards", value: `${totalRewards.toLocaleString()} ZRA`, icon: Gift, color: "text-amber-400" },
            { label: "Max APR", value: "40%", icon: Zap, color: "text-violet-400" },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl p-4 gradient-border hover:bg-secondary/10 transition-colors">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1.5 uppercase tracking-widest font-semibold">
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                {s.label}
              </div>
              <p className="text-lg font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Active stakes */}
        {stakes.filter((s) => s.status === "active").length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-primary" />Active Stakes
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">{activeStakes}</span>
            </h2>
            <div className="space-y-2">
              {stakes.filter((s) => s.status === "active").map((stake) => {
                const daysLeft = Math.max(0, Math.ceil((new Date(stake.end_date).getTime() - Date.now()) / 86400000));
                const progress = Math.min(100, ((stake.duration_days - daysLeft) / stake.duration_days) * 100);
                return (
                  <div key={stake.id} className="glass rounded-xl p-4 gradient-border hover:bg-secondary/10 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-sm">{stake.amount.toLocaleString()} ZRA</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {stake.duration_days}d @ {stake.apr}% APR · <span className="text-primary font-semibold">{daysLeft} days left</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">+{stake.rewards_earned.toLocaleString()} ZRA</p>
                        <p className="text-[10px] text-muted-foreground">earned</p>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
                      <span>{progress.toFixed(0)}% complete</span>
                      <span>{daysLeft}d remaining</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Staking tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {stakingTiers.map((tier) => (
            <div key={tier.duration} className={`glass rounded-xl gradient-border overflow-hidden hover:bg-secondary/10 transition-all duration-300`}>
              <div className={`p-5 bg-gradient-to-br ${tier.color}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-2xl mb-1">{tier.lockIcon}</p>
                    <h3 className="font-display font-bold text-lg">{tier.label}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Min: {tier.minStake.toLocaleString()} ZRA</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gradient">{tier.apr}%</p>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">APR</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <input
                    type="number"
                    placeholder={`Min ${tier.minStake.toLocaleString()} ZRA`}
                    value={amounts[tier.duration] || ""}
                    onChange={(e) => setAmounts((prev) => ({ ...prev, [tier.duration]: e.target.value }))}
                    className="w-full bg-secondary/40 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 border border-border/30 focus:border-primary/30 transition-all"
                  />
                  {amounts[tier.duration] && parseFloat(amounts[tier.duration]) > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/30 rounded-lg px-3 py-2">
                      <Sparkles className="w-3 h-3 text-primary" />
                      Est. rewards: <span className="text-primary font-bold">{calcEstRewards(amounts[tier.duration], tier.apr, tier.duration)} ZRA</span>
                    </div>
                  )}
                  {!user ? (
                    <Button className="w-full glow-sm rounded-xl h-11" onClick={() => navigate("/auth")}>
                      <LogIn className="w-3.5 h-3.5 mr-1.5" /> Sign In to Stake
                    </Button>
                  ) : !connected ? (
                    <Button className="w-full glow-sm rounded-xl h-11" onClick={() => setVisible(true)}>
                      Connect Wallet
                    </Button>
                  ) : (
                    <Button className="w-full glow-sm rounded-xl h-11" disabled={submittingTier === tier.duration} onClick={() => handleStake(tier)}>
                      {submittingTier === tier.duration ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      {submittingTier === tier.duration ? "Staking..." : "Stake ZRA"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DexLayout>
  );
};

export default Staking;
