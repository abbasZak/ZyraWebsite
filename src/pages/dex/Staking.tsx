import { useState, useEffect } from "react";
import { Coins, Lock, Clock, TrendingUp, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import DexLayout from "@/components/dex/DexLayout";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const stakingTiers = [
  { duration: 30, label: "30 Days", apr: 8, minStake: 1000, lockIcon: "🔓" },
  { duration: 90, label: "90 Days", apr: 15, minStake: 5000, lockIcon: "🔒" },
  { duration: 180, label: "180 Days", apr: 25, minStake: 10000, lockIcon: "🔐" },
  { duration: 365, label: "365 Days", apr: 40, minStake: 25000, lockIcon: "🏆" },
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

  // Fetch user stakes
  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("stakes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setStakes(data);
      setLoading(false);
    };
    fetch();
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

      // Refresh
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
        <div className="mb-6">
          <h1 className="text-xl font-display font-bold">Stake ZRA</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Lock your ZRA tokens to earn rewards</p>
        </div>

        {/* Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Staked", value: totalStaked > 0 ? `${totalStaked.toLocaleString()} ZRA` : "0 ZRA", icon: Coins },
            { label: "Active Stakes", value: String(activeStakes), icon: TrendingUp },
            { label: "My Staked", value: totalStaked > 0 ? `${totalStaked.toLocaleString()} ZRA` : "0 ZRA", icon: Lock },
            { label: "Rewards", value: `${totalRewards.toLocaleString()} ZRA`, icon: Clock },
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

        {/* Active stakes */}
        {stakes.filter((s) => s.status === "active").length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold mb-3">Active Stakes</h2>
            <div className="space-y-2">
              {stakes.filter((s) => s.status === "active").map((stake) => {
                const daysLeft = Math.max(0, Math.ceil((new Date(stake.end_date).getTime() - Date.now()) / 86400000));
                return (
                  <div key={stake.id} className="glass rounded-xl p-4 gradient-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">{stake.amount.toLocaleString()} ZRA</p>
                        <p className="text-xs text-muted-foreground">
                          {stake.duration_days} days @ {stake.apr}% APR · {daysLeft} days remaining
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">+{stake.rewards_earned.toLocaleString()} ZRA</p>
                        <p className="text-xs text-muted-foreground">earned</p>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-secondary/50 overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, ((stake.duration_days - daysLeft) / stake.duration_days) * 100)}%` }} />
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
            <div key={tier.duration} className="glass rounded-xl p-5 gradient-border hover:bg-secondary/20 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-2xl mb-1">{tier.lockIcon}</p>
                  <h3 className="font-display font-bold">{tier.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Min: {tier.minStake.toLocaleString()} ZRA</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{tier.apr}%</p>
                  <p className="text-xs text-muted-foreground">APR</p>
                </div>
              </div>
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder={`Min ${tier.minStake.toLocaleString()} ZRA`}
                  value={amounts[tier.duration] || ""}
                  onChange={(e) => setAmounts((prev) => ({ ...prev, [tier.duration]: e.target.value }))}
                  className="w-full bg-secondary/30 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30"
                />
                {amounts[tier.duration] && parseFloat(amounts[tier.duration]) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Est. rewards: <span className="text-primary font-medium">{calcEstRewards(amounts[tier.duration], tier.apr, tier.duration)} ZRA</span>
                  </p>
                )}
                {!user ? (
                  <Button className="w-full glow-sm" size="sm" onClick={() => navigate("/auth")}>
                    <LogIn className="w-3.5 h-3.5 mr-1" /> Sign In
                  </Button>
                ) : !connected ? (
                  <Button className="w-full glow-sm" size="sm" onClick={() => setVisible(true)}>
                    Connect Wallet
                  </Button>
                ) : (
                  <Button className="w-full glow-sm" size="sm" disabled={submittingTier === tier.duration} onClick={() => handleStake(tier)}>
                    {submittingTier === tier.duration ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {submittingTier === tier.duration ? "Staking..." : "Stake ZRA"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DexLayout>
  );
};

export default Staking;
