import { Coins, Lock, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import DexLayout from "@/components/dex/DexLayout";

const stakingTiers = [
  { duration: "30 Days", apr: "8%", minStake: "1,000 ZRA", lockIcon: "🔓" },
  { duration: "90 Days", apr: "15%", minStake: "5,000 ZRA", lockIcon: "🔒" },
  { duration: "180 Days", apr: "25%", minStake: "10,000 ZRA", lockIcon: "🔐" },
  { duration: "365 Days", apr: "40%", minStake: "25,000 ZRA", lockIcon: "🏆" },
];

const Staking = () => {
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
            { label: "Total Staked", value: "42.5M ZRA", icon: Coins },
            { label: "Avg APR", value: "22%", icon: TrendingUp },
            { label: "My Staked", value: "0 ZRA", icon: Lock },
            { label: "Rewards", value: "0 ZRA", icon: Clock },
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

        {/* Staking tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {stakingTiers.map((tier) => (
            <div key={tier.duration} className="glass rounded-xl p-5 gradient-border hover:bg-secondary/20 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-2xl mb-1">{tier.lockIcon}</p>
                  <h3 className="font-display font-bold">{tier.duration}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Min: {tier.minStake}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{tier.apr}</p>
                  <p className="text-xs text-muted-foreground">APR</p>
                </div>
              </div>
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Enter ZRA amount"
                  className="w-full bg-secondary/30 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30"
                />
                <Button className="w-full glow-sm" size="sm">
                  Stake ZRA
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DexLayout>
  );
};

export default Staking;
