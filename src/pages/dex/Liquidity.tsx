import { Droplets, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import DexLayout from "@/components/dex/DexLayout";

const pools = [
  { pair: "ZRA / USDC", tvl: "$2.4M", apr: "18.5%", volume24h: "$340K", myLiquidity: "$0.00", icon1: "⚡", icon2: "💲" },
  { pair: "ZRA / SOL", tvl: "$1.8M", apr: "22.1%", volume24h: "$280K", myLiquidity: "$0.00", icon1: "⚡", icon2: "◎" },
  { pair: "SOL / USDC", tvl: "$5.1M", apr: "12.3%", volume24h: "$890K", myLiquidity: "$0.00", icon1: "◎", icon2: "💲" },
  { pair: "ZRA / USDT", tvl: "$980K", apr: "25.7%", volume24h: "$120K", myLiquidity: "$0.00", icon1: "⚡", icon2: "💵" },
];

const Liquidity = () => {
  return (
    <DexLayout>
      <div className="p-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-display font-bold">Liquidity Pools</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Provide liquidity and earn trading fees</p>
          </div>
          <Button size="sm" className="gap-1.5 glow-sm">
            <Plus className="w-3.5 h-3.5" />
            New Position
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total TVL", value: "$10.3M", icon: Droplets },
            { label: "24h Volume", value: "$1.63M", icon: TrendingUp },
            { label: "Total Pools", value: "4", icon: Droplets },
            { label: "My Positions", value: "0", icon: Plus },
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

        {/* Pool list */}
        <div className="space-y-2">
          {pools.map((pool) => (
            <div key={pool.pair} className="glass rounded-xl p-4 gradient-border hover:bg-secondary/20 transition-colors">
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
                    <p className="font-medium">{pool.myLiquidity}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-primary/20 hover:border-primary/40 text-xs shrink-0">
                  Add Liquidity
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DexLayout>
  );
};

export default Liquidity;
