import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import DexLayout from "@/components/dex/DexLayout";

const orderBookBids = [
  { price: 0.1998, amount: 12500, total: 2497.5 },
  { price: 0.1995, amount: 8300, total: 1655.85 },
  { price: 0.1992, amount: 15200, total: 3027.84 },
  { price: 0.1988, amount: 6700, total: 1331.96 },
  { price: 0.1985, amount: 21000, total: 4168.5 },
  { price: 0.1980, amount: 9400, total: 1861.2 },
];

const orderBookAsks = [
  { price: 0.2002, amount: 11000, total: 2202.2 },
  { price: 0.2005, amount: 7800, total: 1563.9 },
  { price: 0.2010, amount: 14500, total: 2914.5 },
  { price: 0.2015, amount: 5200, total: 1047.8 },
  { price: 0.2020, amount: 18300, total: 3696.6 },
  { price: 0.2025, amount: 8100, total: 1640.25 },
];

const recentTrades = [
  { price: 0.2000, amount: 5000, time: "12:45:32", side: "buy" as const },
  { price: 0.1999, amount: 3200, time: "12:45:28", side: "sell" as const },
  { price: 0.2001, amount: 8700, time: "12:45:25", side: "buy" as const },
  { price: 0.1998, amount: 1500, time: "12:45:20", side: "sell" as const },
  { price: 0.2000, amount: 4200, time: "12:45:15", side: "buy" as const },
  { price: 0.2002, amount: 6100, time: "12:45:10", side: "buy" as const },
];

const Trade = () => {
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [side, setSide] = useState<"buy" | "sell">("buy");

  const maxAsk = Math.max(...orderBookAsks.map((o) => o.amount));
  const maxBid = Math.max(...orderBookBids.map((o) => o.amount));

  return (
    <DexLayout>
      <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 max-w-7xl mx-auto">
        {/* Chart area */}
        <div className="lg:col-span-8 glass rounded-xl p-4 gradient-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-lg">ZRA / USDC</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-bold text-primary">$0.2000</span>
                <span className="text-xs flex items-center gap-0.5 text-primary">
                  <TrendingUp className="w-3 h-3" />+2.4%
                </span>
              </div>
            </div>
            <div className="flex gap-1 text-xs">
              {["1H", "4H", "1D", "1W"].map((t) => (
                <button key={t} className="px-2.5 py-1 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
                  {t}
                </button>
              ))}
            </div>
          </div>
          {/* Placeholder chart */}
          <div className="h-64 md:h-80 rounded-lg bg-secondary/20 flex items-center justify-center border border-border/30">
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <p className="text-sm text-muted-foreground">TradingView chart integration</p>
              <p className="text-xs text-muted-foreground/60">Connect to display live candles</p>
            </div>
          </div>
          {/* Volume bar */}
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span>24h Vol: <span className="text-foreground font-medium">$1.2M</span></span>
            <span>24h High: <span className="text-primary">$0.2050</span></span>
            <span>24h Low: <span className="text-destructive">$0.1950</span></span>
          </div>
        </div>

        {/* Order form */}
        <div className="lg:col-span-4 space-y-3">
          <div className="glass rounded-xl p-4 gradient-border">
            <div className="flex gap-1 mb-4">
              <button
                onClick={() => setSide("buy")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  side === "buy" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary/50"
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setSide("sell")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  side === "sell" ? "bg-destructive/15 text-destructive" : "text-muted-foreground hover:bg-secondary/50"
                }`}
              >
                Sell
              </button>
            </div>

            <div className="flex gap-1 mb-4">
              {(["limit", "market"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setOrderType(t)}
                  className={`text-xs px-3 py-1.5 rounded-lg capitalize transition-colors ${
                    orderType === t ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {orderType === "limit" && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Price (USDC)</label>
                  <input
                    type="number"
                    defaultValue="0.2000"
                    className="w-full bg-secondary/30 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
              )}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Amount (ZRA)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full bg-secondary/30 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div className="flex gap-1">
                {[25, 50, 75, 100].map((pct) => (
                  <button key={pct} className="flex-1 text-xs py-1 rounded bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                    {pct}%
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Total (USDC)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  readOnly
                  className="w-full bg-secondary/30 rounded-lg px-3 py-2.5 text-sm outline-none"
                />
              </div>
              <Button
                className={`w-full h-11 font-semibold ${
                  side === "buy" ? "glow-sm" : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                }`}
              >
                {side === "buy" ? "Buy ZRA" : "Sell ZRA"}
              </Button>
            </div>
          </div>

          {/* Mini order book */}
          <div className="glass rounded-xl p-4 gradient-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Order Book</h3>
            <div className="text-[11px] space-y-0.5">
              {orderBookAsks.slice().reverse().map((o, i) => (
                <div key={i} className="flex justify-between py-0.5 relative">
                  <div className="absolute right-0 top-0 bottom-0 bg-destructive/5 rounded-sm" style={{ width: `${(o.amount / maxAsk) * 100}%` }} />
                  <span className="text-destructive relative z-10">{o.price.toFixed(4)}</span>
                  <span className="text-muted-foreground relative z-10">{o.amount.toLocaleString()}</span>
                </div>
              ))}
              <div className="text-center py-1.5 text-primary font-bold text-sm border-y border-border/30 my-1">
                $0.2000
              </div>
              {orderBookBids.map((o, i) => (
                <div key={i} className="flex justify-between py-0.5 relative">
                  <div className="absolute right-0 top-0 bottom-0 bg-primary/5 rounded-sm" style={{ width: `${(o.amount / maxBid) * 100}%` }} />
                  <span className="text-primary relative z-10">{o.price.toFixed(4)}</span>
                  <span className="text-muted-foreground relative z-10">{o.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent trades */}
        <div className="lg:col-span-12 glass rounded-xl p-4 gradient-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent Trades</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border/30">
                  <th className="text-left py-2 font-medium">Price</th>
                  <th className="text-right py-2 font-medium">Amount</th>
                  <th className="text-right py-2 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map((t, i) => (
                  <tr key={i} className="border-b border-border/10">
                    <td className={`py-1.5 ${t.side === "buy" ? "text-primary" : "text-destructive"}`}>
                      {t.price.toFixed(4)}
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
