import { useState } from "react";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Shield,
  Activity,
  PieChart,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BarChart3,
  Zap,
  Eye,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DexLayout from "@/components/dex/DexLayout";

type AITool = "assistant" | "liquidity" | "fraud" | "risk" | "portfolio";

const tools: { id: AITool; label: string; icon: typeof Brain; desc: string; gradient: string }[] = [
  { id: "assistant", label: "Trading Assistant", icon: Brain, desc: "AI-powered market signals", gradient: "from-primary/20 to-primary/5" },
  { id: "liquidity", label: "Liquidity Optimizer", icon: Droplets, desc: "Pool allocation engine", gradient: "from-blue-500/20 to-blue-500/5" },
  { id: "fraud", label: "Fraud Detection", icon: Shield, desc: "Transaction monitoring", gradient: "from-amber-500/20 to-amber-500/5" },
  { id: "risk", label: "Risk Analysis", icon: AlertTriangle, desc: "Market anomaly alerts", gradient: "from-red-500/20 to-red-500/5" },
  { id: "portfolio", label: "Portfolio Insights", icon: PieChart, desc: "Performance analytics", gradient: "from-violet-500/20 to-violet-500/5" },
];

/* ── Simulated AI data for each tool ── */

const tradingSignals = [
  { pair: "ZRA/USDC", signal: "Strong Buy", confidence: 92, trend: "up" as const, reason: "LSTM model detected bullish divergence with increasing volume momentum" },
  { pair: "SOL/USDC", signal: "Hold", confidence: 67, trend: "up" as const, reason: "Sideways consolidation; Transformer model predicts breakout in 4-6 hours" },
  { pair: "ZRA/SOL", signal: "Buy", confidence: 84, trend: "up" as const, reason: "Positive cross-correlation with SOL rally; mean reversion model agrees" },
  { pair: "BONK/USDC", signal: "Sell", confidence: 78, trend: "down" as const, reason: "Overbought RSI with declining whale accumulation detected by anomaly model" },
];

const liquidityPools = [
  { pool: "ZRA/USDC", currentAPR: 24.5, optimalAlloc: 35, currentAlloc: 28, slippageReduction: "18%", action: "Increase" },
  { pool: "ZRA/SOL", currentAPR: 31.2, optimalAlloc: 25, currentAlloc: 30, slippageReduction: "12%", action: "Decrease" },
  { pool: "SOL/USDC", currentAPR: 18.8, optimalAlloc: 25, currentAlloc: 22, slippageReduction: "8%", action: "Increase" },
  { pool: "BONK/ZRA", currentAPR: 42.1, optimalAlloc: 15, currentAlloc: 20, slippageReduction: "22%", action: "Decrease" },
];

const fraudAlerts = [
  { id: "TX-4829", type: "Wash Trading", severity: "High", address: "7xK...m3P", timestamp: "2 min ago", status: "flagged" as const },
  { id: "TX-4815", type: "Front Running", severity: "Critical", address: "3Bq...nR7", timestamp: "8 min ago", status: "blocked" as const },
  { id: "TX-4801", type: "Unusual Volume", severity: "Medium", address: "9Lp...wF2", timestamp: "15 min ago", status: "monitoring" as const },
  { id: "TX-4798", type: "Sybil Pattern", severity: "High", address: "5Ht...aK9", timestamp: "22 min ago", status: "flagged" as const },
];

const riskMetrics = [
  { metric: "Market Volatility Index", value: "67/100", status: "elevated" as const, detail: "Above average; Autoencoder detected regime shift" },
  { metric: "Liquidity Depth Score", value: "82/100", status: "healthy" as const, detail: "Strong bid/ask depth across major pairs" },
  { metric: "Whale Activity Index", value: "45/100", status: "normal" as const, detail: "No significant large-holder movements detected" },
  { metric: "Correlation Risk", value: "71/100", status: "elevated" as const, detail: "ZRA showing increased correlation with SOL movements" },
  { metric: "Smart Contract Risk", value: "94/100", status: "healthy" as const, detail: "All audited contracts passing integrity checks" },
];

const portfolioData = {
  totalValue: 12847.32,
  pnl24h: 342.18,
  pnlPercent: 2.73,
  riskScore: 42,
  holdings: [
    { token: "ZRA", amount: 25000, value: 5000, allocation: 38.9, change24h: 4.2 },
    { token: "SOL", amount: 18.5, value: 3300.77, allocation: 25.7, change24h: 1.8 },
    { token: "USDC", amount: 2500, value: 2500, allocation: 19.5, change24h: 0.0 },
    { token: "BONK", amount: 85000000, value: 1275, allocation: 9.9, change24h: -3.1 },
    { token: "RAY", amount: 320, value: 771.55, allocation: 6.0, change24h: 2.5 },
  ],
};

/* ── Subcomponents ── */

const SignalBadge = ({ signal }: { signal: string }) => {
  const colors: Record<string, string> = {
    "Strong Buy": "bg-primary/15 text-primary",
    Buy: "bg-primary/10 text-primary/80",
    Hold: "bg-muted text-muted-foreground",
    Sell: "bg-destructive/15 text-destructive",
  };
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${colors[signal] ?? colors.Hold}`}>{signal}</span>;
};

const SeverityDot = ({ severity }: { severity: string }) => {
  const c = severity === "Critical" ? "bg-red-500" : severity === "High" ? "bg-amber-500" : "bg-yellow-400";
  return <span className={`inline-block w-2 h-2 rounded-full ${c}`} />;
};

const StatusBadge = ({ status }: { status: string }) => {
  const m: Record<string, string> = {
    flagged: "bg-amber-500/15 text-amber-400",
    blocked: "bg-red-500/15 text-red-400",
    monitoring: "bg-blue-500/15 text-blue-400",
  };
  return <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${m[status] ?? m.monitoring}`}>{status}</span>;
};

const RiskBar = ({ value, status }: { value: string; status: string }) => {
  const num = parseInt(value);
  const color = status === "healthy" ? "bg-primary" : status === "elevated" ? "bg-amber-500" : "bg-muted-foreground";
  return (
    <div className="w-full bg-secondary/50 rounded-full h-1.5">
      <div className={`h-1.5 rounded-full ${color} transition-all`} style={{ width: `${num}%` }} />
    </div>
  );
};

const ConfidenceRing = ({ value }: { value: number }) => {
  const circumference = 2 * Math.PI * 18;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative w-12 h-12 shrink-0">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="none" stroke="hsl(var(--secondary))" strokeWidth="3" />
        <circle cx="20" cy="20" r="18" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary">{value}%</span>
    </div>
  );
};

/* ── Panels ── */

const TradingAssistantPanel = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-display font-bold flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />AI Trading Assistant
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">LSTM + Transformer ensemble · Updated 30s ago</p>
      </div>
      <Button size="sm" variant="outline" className="gap-1.5 text-xs"><RefreshCw className="w-3 h-3" />Refresh</Button>
    </div>
    <div className="grid gap-3">
      {tradingSignals.map((s) => (
        <div key={s.pair} className="glass rounded-xl p-4 gradient-border hover:bg-secondary/20 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <ConfidenceRing value={s.confidence} />
              <div>
                <span className="font-semibold text-sm">{s.pair}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <SignalBadge signal={s.signal} />
                  {s.trend === "up" ? <TrendingUp className="w-3 h-3 text-primary" /> : <TrendingDown className="w-3 h-3 text-destructive" />}
                </div>
              </div>
            </div>
            <Button size="sm" className="text-xs gap-1 glow-sm">
              Trade <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{s.reason}</p>
        </div>
      ))}
    </div>
    <div className="glass rounded-xl p-4 gradient-border">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Sparkles className="w-3 h-3 text-primary" />Model Performance
      </h3>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div><p className="text-xl font-bold text-primary">87.3%</p><p className="text-[10px] text-muted-foreground">Accuracy (30d)</p></div>
        <div><p className="text-xl font-bold text-foreground">1,247</p><p className="text-[10px] text-muted-foreground">Signals Generated</p></div>
        <div><p className="text-xl font-bold text-primary">+18.4%</p><p className="text-[10px] text-muted-foreground">Avg Return</p></div>
      </div>
    </div>
  </div>
);

const LiquidityOptimizerPanel = () => (
  <div className="space-y-4">
    <div>
      <h2 className="text-lg font-display font-bold flex items-center gap-2">
        <Droplets className="w-5 h-5 text-blue-400" />Liquidity Optimizer
      </h2>
      <p className="text-xs text-muted-foreground mt-0.5">Gradient-based allocation model · Minimizes aggregate slippage</p>
    </div>
    <div className="glass rounded-xl overflow-hidden gradient-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/30 text-muted-foreground">
            <th className="text-left py-3 px-4 font-medium">Pool</th>
            <th className="text-right py-3 px-4 font-medium">APR</th>
            <th className="text-right py-3 px-4 font-medium hidden sm:table-cell">Current</th>
            <th className="text-right py-3 px-4 font-medium">Optimal</th>
            <th className="text-right py-3 px-4 font-medium hidden sm:table-cell">Slippage ↓</th>
            <th className="text-right py-3 px-4 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {liquidityPools.map((p) => (
            <tr key={p.pool} className="border-b border-border/10 hover:bg-secondary/20 transition-colors">
              <td className="py-3 px-4 font-semibold">{p.pool}</td>
              <td className="text-right py-3 px-4 text-primary font-medium">{p.currentAPR}%</td>
              <td className="text-right py-3 px-4 text-muted-foreground hidden sm:table-cell">{p.currentAlloc}%</td>
              <td className="text-right py-3 px-4 font-semibold">{p.optimalAlloc}%</td>
              <td className="text-right py-3 px-4 text-primary hidden sm:table-cell">-{p.slippageReduction}</td>
              <td className="text-right py-3 px-4">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.action === "Increase" ? "bg-primary/15 text-primary" : "bg-amber-500/15 text-amber-400"}`}>
                  {p.action}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="glass rounded-xl p-4 gradient-border text-center">
        <p className="text-2xl font-bold text-blue-400">-15.2%</p>
        <p className="text-[10px] text-muted-foreground mt-1">Estimated Slippage Reduction</p>
      </div>
      <div className="glass rounded-xl p-4 gradient-border text-center">
        <p className="text-2xl font-bold text-primary">+3.8%</p>
        <p className="text-[10px] text-muted-foreground mt-1">Projected APR Gain</p>
      </div>
    </div>
    <Button className="w-full glow-sm gap-2"><Zap className="w-4 h-4" />Apply Optimal Allocation</Button>
  </div>
);

const FraudDetectionPanel = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-display font-bold flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" />Fraud Detection
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">Isolation Forest + Autoencoder · Real-time monitoring</p>
      </div>
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-[10px] text-primary font-semibold">Live</span>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-3">
      <div className="glass rounded-xl p-3 gradient-border text-center">
        <p className="text-xl font-bold text-foreground">2,481</p>
        <p className="text-[10px] text-muted-foreground">TX Scanned (1h)</p>
      </div>
      <div className="glass rounded-xl p-3 gradient-border text-center">
        <p className="text-xl font-bold text-amber-400">4</p>
        <p className="text-[10px] text-muted-foreground">Flagged</p>
      </div>
      <div className="glass rounded-xl p-3 gradient-border text-center">
        <p className="text-xl font-bold text-red-400">1</p>
        <p className="text-[10px] text-muted-foreground">Blocked</p>
      </div>
    </div>
    <div className="space-y-2">
      {fraudAlerts.map((a) => (
        <div key={a.id} className="glass rounded-xl p-3 gradient-border flex items-center justify-between gap-3 hover:bg-secondary/20 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <SeverityDot severity={a.severity} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold">{a.type}</span>
                <span className="text-[10px] text-muted-foreground">{a.id}</span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                {a.address} · {a.timestamp} · {a.severity}
              </p>
            </div>
          </div>
          <StatusBadge status={a.status} />
        </div>
      ))}
    </div>
  </div>
);

const RiskAnalysisPanel = () => (
  <div className="space-y-4">
    <div>
      <h2 className="text-lg font-display font-bold flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-400" />Risk Analysis
      </h2>
      <p className="text-xs text-muted-foreground mt-0.5">Multi-factor anomaly detection · Updated every block</p>
    </div>
    <div className="glass rounded-xl p-4 gradient-border">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overall Risk Level</span>
        <span className="text-sm font-bold text-amber-400">Moderate</span>
      </div>
      <div className="w-full bg-secondary/50 rounded-full h-3 overflow-hidden">
        <div className="h-3 rounded-full bg-gradient-to-r from-primary via-amber-500 to-red-500 transition-all" style={{ width: "55%" }} />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
        <span>Low</span><span>Moderate</span><span>High</span><span>Extreme</span>
      </div>
    </div>
    <div className="space-y-3">
      {riskMetrics.map((m) => (
        <div key={m.metric} className="glass rounded-xl p-4 gradient-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">{m.metric}</span>
            <span className={`text-xs font-bold ${m.status === "healthy" ? "text-primary" : m.status === "elevated" ? "text-amber-400" : "text-muted-foreground"}`}>
              {m.value}
            </span>
          </div>
          <RiskBar value={m.value} status={m.status} />
          <p className="text-[11px] text-muted-foreground mt-2">{m.detail}</p>
        </div>
      ))}
    </div>
  </div>
);

const PortfolioInsightsPanel = () => (
  <div className="space-y-4">
    <div>
      <h2 className="text-lg font-display font-bold flex items-center gap-2">
        <PieChart className="w-5 h-5 text-violet-400" />Portfolio Insights
      </h2>
      <p className="text-xs text-muted-foreground mt-0.5">Personalized analytics · Risk-adjusted performance</p>
    </div>
    {/* Overview cards */}
    <div className="grid grid-cols-2 gap-3">
      <div className="glass rounded-xl p-4 gradient-border">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Portfolio Value</p>
        <p className="text-xl font-bold">${portfolioData.totalValue.toLocaleString()}</p>
        <p className="text-xs text-primary mt-0.5 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />+${portfolioData.pnl24h.toFixed(2)} ({portfolioData.pnlPercent}%)
        </p>
      </div>
      <div className="glass rounded-xl p-4 gradient-border">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Risk Score</p>
        <p className="text-xl font-bold">{portfolioData.riskScore}<span className="text-xs text-muted-foreground">/100</span></p>
        <p className="text-xs text-primary mt-0.5">Low Risk</p>
      </div>
    </div>
    {/* Holdings */}
    <div className="glass rounded-xl overflow-hidden gradient-border">
      <div className="p-3 border-b border-border/30">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Eye className="w-3 h-3" />Holdings Breakdown
        </h3>
      </div>
      {portfolioData.holdings.map((h) => (
        <div key={h.token} className="flex items-center justify-between px-4 py-3 border-b border-border/10 last:border-0 hover:bg-secondary/20 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">{h.token[0]}</div>
            <div>
              <span className="text-sm font-semibold">{h.token}</span>
              <p className="text-[10px] text-muted-foreground">{h.allocation}% of portfolio</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">${h.value.toLocaleString()}</p>
            <p className={`text-[11px] ${h.change24h >= 0 ? "text-primary" : "text-destructive"}`}>
              {h.change24h >= 0 ? "+" : ""}{h.change24h}%
            </p>
          </div>
        </div>
      ))}
    </div>
    {/* AI Recommendations */}
    <div className="glass rounded-xl p-4 gradient-border">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Sparkles className="w-3 h-3 text-violet-400" />AI Recommendations
      </h3>
      <div className="space-y-2">
        <div className="flex items-start gap-2 text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
          <span className="text-muted-foreground">Diversification is good. Consider reducing BONK exposure by 3% to lower overall volatility.</span>
        </div>
        <div className="flex items-start gap-2 text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
          <span className="text-muted-foreground">ZRA staking could yield an additional 12.4% APR on your current holdings.</span>
        </div>
        <div className="flex items-start gap-2 text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
          <span className="text-muted-foreground">Your risk-adjusted return (Sharpe ratio: 1.82) outperforms 78% of similar portfolios.</span>
        </div>
      </div>
    </div>
  </div>
);

/* ── Main page ── */

const panelMap: Record<AITool, () => JSX.Element> = {
  assistant: TradingAssistantPanel,
  liquidity: LiquidityOptimizerPanel,
  fraud: FraudDetectionPanel,
  risk: RiskAnalysisPanel,
  portfolio: PortfolioInsightsPanel,
};

const AIHub = () => {
  const [activeTool, setActiveTool] = useState<AITool>("assistant");
  const Panel = panelMap[activeTool];

  return (
    <DexLayout>
      <div className="p-4 max-w-5xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <Sparkles className="w-3 h-3" />Powered by Machine Intelligence
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">
            AI Trading Suite
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Five AI engines working together to optimize your trading, protect your assets, and maximize returns.
          </p>
        </div>

        {/* Tool selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {tools.map((t) => {
            const active = activeTool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTool(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  active
                    ? "bg-gradient-to-r " + t.gradient + " text-foreground ring-1 ring-border"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                }`}
              >
                <t.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Active panel */}
        <div className="animate-in fade-in-50 duration-300">
          <Panel />
        </div>
      </div>
    </DexLayout>
  );
};

export default AIHub;
