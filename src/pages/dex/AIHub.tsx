import { useState, useEffect, useCallback, useRef } from "react";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Shield,
  Activity,
  PieChart,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BarChart3,
  Zap,
  Eye,
  RefreshCw,
  Loader2,
  GraduationCap,
  Send,
  BookOpen,
  Lightbulb,
  ChevronRight,
  Bot,
  Lock,
  Gauge,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DexLayout from "@/components/dex/DexLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

type AITool = "assistant" | "security" | "portfolio" | "instructor";

const tools: { id: AITool; label: string; shortLabel: string; icon: typeof Brain; desc: string; gradient: string; glow: string }[] = [
  { id: "assistant", label: "Trading Assistant", shortLabel: "Trading", icon: Brain, desc: "AI-powered signals & analysis", gradient: "from-primary/20 via-emerald-500/10 to-transparent", glow: "shadow-primary/20" },
  { id: "security", label: "Security & Optimization", shortLabel: "Security", icon: Shield, desc: "Fraud, risk & liquidity intel", gradient: "from-amber-500/20 via-orange-500/10 to-transparent", glow: "shadow-amber-500/20" },
  { id: "portfolio", label: "Portfolio Insights", shortLabel: "Portfolio", icon: PieChart, desc: "Performance & recommendations", gradient: "from-violet-500/20 via-purple-500/10 to-transparent", glow: "shadow-violet-500/20" },
  { id: "instructor", label: "DeFi Academy", shortLabel: "Academy", icon: GraduationCap, desc: "Learn crypto & DeFi interactively", gradient: "from-cyan-500/20 via-teal-500/10 to-transparent", glow: "shadow-cyan-500/20" },
];

/* ── Shared hook to call AI ── */
function useAITool(tool: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (question?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("ai-hub", {
        body: { tool, ...(question ? { question } : {}) },
      });
      if (fnError) throw new Error(fnError.message);
      if (result?.error) throw new Error(result.error);
      setData(result);
      return result;
    } catch (e: any) {
      const msg = e?.message || "AI request failed";
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [tool]);

  useEffect(() => {
    if (tool !== "instructor") fetchData();
  }, [fetchData, tool]);

  return { data, loading, error, refresh: fetchData };
}

/* ── Shared UI Components ── */

const SignalBadge = ({ signal }: { signal: string }) => {
  const colors: Record<string, string> = {
    "Strong Buy": "bg-primary/20 text-primary border border-primary/30",
    Buy: "bg-primary/10 text-primary/80 border border-primary/20",
    Hold: "bg-muted text-muted-foreground border border-border/30",
    Sell: "bg-destructive/15 text-destructive border border-destructive/20",
    "Strong Sell": "bg-destructive/20 text-destructive border border-destructive/30",
  };
  return <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${colors[signal] ?? colors.Hold}`}>{signal}</span>;
};

const SeverityDot = ({ severity }: { severity: string }) => {
  const c = severity === "Critical" ? "bg-red-500 shadow-red-500/50" : severity === "High" ? "bg-amber-500 shadow-amber-500/50" : "bg-yellow-400 shadow-yellow-400/50";
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${c} shadow-lg`} />;
};

const StatusBadge = ({ status }: { status: string }) => {
  const m: Record<string, string> = {
    flagged: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
    blocked: "bg-red-500/15 text-red-400 border border-red-500/20",
    monitoring: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  };
  return <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${m[status] ?? m.monitoring}`}>{status}</span>;
};

const RiskBar = ({ value, status }: { value: string; status: string }) => {
  const num = parseInt(value);
  const color = status === "healthy" ? "bg-gradient-to-r from-primary to-emerald-400" : status === "elevated" ? "bg-gradient-to-r from-amber-500 to-orange-400" : status === "critical" ? "bg-gradient-to-r from-red-500 to-rose-400" : "bg-muted-foreground";
  return (
    <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
      <div className={`h-2 rounded-full ${color} transition-all duration-700`} style={{ width: `${num}%` }} />
    </div>
  );
};

const ConfidenceRing = ({ value }: { value: number }) => {
  const circumference = 2 * Math.PI * 18;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 70 ? "hsl(var(--primary))" : value >= 40 ? "hsl(45 100% 55%)" : "hsl(var(--destructive))";
  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="none" stroke="hsl(var(--secondary))" strokeWidth="2.5" />
        <circle cx="20" cy="20" r="18" fill="none" stroke={color} strokeWidth="2.5" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color }}>{value}%</span>
    </div>
  );
};

const LoadingState = ({ message = "AI is analyzing data..." }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <div className="relative">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
        <Brain className="w-7 h-7 text-primary animate-pulse" />
      </div>
      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary/30 animate-ping" />
    </div>
    <div className="text-center">
      <p className="text-sm font-medium text-foreground">{message}</p>
      <p className="text-xs text-muted-foreground mt-1">This usually takes a few seconds</p>
    </div>
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <div key={i} className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  </div>
);

const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
      <AlertTriangle className="w-7 h-7 text-destructive" />
    </div>
    <p className="text-sm text-destructive text-center max-w-xs">{error}</p>
    <Button size="sm" variant="outline" onClick={onRetry} className="gap-1.5">
      <RefreshCw className="w-3 h-3" />Retry
    </Button>
  </div>
);

/* ── Section Card Wrapper ── */
const SectionCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`glass rounded-2xl gradient-border overflow-hidden ${className}`}>
    {children}
  </div>
);

/* ── TRADING ASSISTANT PANEL ── */

const TradingAssistantPanel = () => {
  const { data, loading, error, refresh } = useAITool("assistant");
  const navigate = useNavigate();
  
  if (loading) return <LoadingState message="Scanning markets for signals..." />;
  if (error) return <ErrorState error={error} onRetry={refresh} />;
  if (!data) return null;

  const signals = data.signals || [];
  const perf = data.modelPerformance || {};

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center glow-sm">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold">Trading Signals</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] text-primary font-semibold">Live Analysis</span>
            </div>
          </div>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs rounded-xl" onClick={() => refresh()}>
          <RefreshCw className="w-3 h-3" />Refresh
        </Button>
      </div>

      {/* Model Performance Banner */}
      {perf && (
        <SectionCard>
          <div className="p-4 bg-gradient-to-r from-primary/5 via-transparent to-emerald-500/5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Model Performance</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gradient">{perf.accuracy}%</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Accuracy</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{perf.signalsGenerated?.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Signals</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gradient">+{perf.avgReturn}%</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Avg Return</p>
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Signal Cards */}
      <div className="grid gap-3">
        {signals.map((s: any, idx: number) => (
          <SectionCard key={s.pair}>
            <div className="p-4 hover:bg-secondary/10 transition-all duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <ConfidenceRing value={s.confidence} />
                  <div>
                    <span className="font-bold text-sm">{s.pair}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <SignalBadge signal={s.signal} />
                      {s.trend === "up" ? (
                        <span className="flex items-center gap-0.5 text-[10px] text-primary font-semibold">
                          <TrendingUp className="w-3 h-3" />Bullish
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-[10px] text-destructive font-semibold">
                          <TrendingDown className="w-3 h-3" />Bearish
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="text-xs gap-1.5 glow-sm rounded-xl"
                  onClick={() => navigate("/dex/trade")}
                >
                  Trade <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pl-[4.25rem]">{s.reason}</p>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
};

/* ── SECURITY & OPTIMIZATION PANEL ── */

const SecurityOptimizationPanel = () => {
  const fraud = useAITool("fraud");
  const risk = useAITool("risk");

  const anyLoading = fraud.loading || risk.loading;

  const refreshAll = () => {
    fraud.refresh();
    risk.refresh();
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-500/5 flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold">Security & Risk Monitor</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <Radio className="w-3 h-3 text-primary animate-pulse" />
              <span className="text-[10px] text-primary font-semibold">Monitoring Active</span>
            </div>
          </div>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs rounded-xl" onClick={refreshAll} disabled={anyLoading}>
          <RefreshCw className={`w-3 h-3 ${anyLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <Tabs defaultValue="fraud" className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-4 bg-secondary/30 rounded-xl p-1">
          <TabsTrigger value="fraud" className="text-xs gap-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md"><Shield className="w-3 h-3" />Fraud Detection</TabsTrigger>
          <TabsTrigger value="risk" className="text-xs gap-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md"><Gauge className="w-3 h-3" />Risk Assessment</TabsTrigger>
        </TabsList>

        {/* Fraud Tab */}
        <TabsContent value="fraud">
          {fraud.loading ? <LoadingState message="Scanning for suspicious activity..." /> :
           fraud.error ? <ErrorState error={fraud.error} onRetry={() => fraud.refresh()} /> :
           fraud.data ? (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "TX Scanned (1h)", value: fraud.data.stats?.txScanned?.toLocaleString(), color: "text-foreground", icon: Eye },
                  { label: "Flagged", value: fraud.data.stats?.flagged, color: "text-amber-400", icon: AlertTriangle },
                  { label: "Blocked", value: fraud.data.stats?.blocked, color: "text-red-400", icon: Lock },
                ].map((s) => (
                  <SectionCard key={s.label}>
                    <div className="p-3 text-center">
                      <s.icon className={`w-4 h-4 ${s.color} mx-auto mb-1.5 opacity-70`} />
                      <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                    </div>
                  </SectionCard>
                ))}
              </div>
              <div className="space-y-2">
                {(fraud.data.alerts || []).map((a: any, i: number) => (
                  <SectionCard key={a.id || i}>
                    <div className="p-3.5 flex items-center justify-between gap-3 hover:bg-secondary/10 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <SeverityDot severity={a.severity} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold">{a.type}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{a.id}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {a.address} · {a.timestamp} · {a.severity}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={a.status} />
                    </div>
                  </SectionCard>
                ))}
              </div>
            </div>
          ) : null}
        </TabsContent>

        {/* Risk Tab */}
        <TabsContent value="risk">
          {risk.loading ? <LoadingState message="Assessing market risk conditions..." /> :
           risk.error ? <ErrorState error={risk.error} onRetry={() => risk.refresh()} /> :
           risk.data ? (
            <div className="space-y-4 animate-fade-in">
              <SectionCard>
                <div className="p-5 bg-gradient-to-r from-secondary/20 to-transparent">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Overall Risk Level</span>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                      risk.data.overallLevel === "Low" ? "text-primary bg-primary/10" :
                      risk.data.overallLevel === "Moderate" ? "text-amber-400 bg-amber-500/10" :
                      risk.data.overallLevel === "High" ? "text-red-400 bg-red-500/10" : "text-red-500 bg-red-500/15"
                    }`}>{risk.data.overallLevel}</span>
                  </div>
                  <div className="w-full bg-secondary/50 rounded-full h-4 overflow-hidden">
                    <div className="h-4 rounded-full bg-gradient-to-r from-primary via-amber-500 to-red-500 transition-all duration-1000" style={{ width: `${risk.data.overallPercent || 50}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                    <span>Low</span><span>Moderate</span><span>High</span><span>Extreme</span>
                  </div>
                </div>
              </SectionCard>
              <div className="space-y-3">
                {(risk.data.metrics || []).map((m: any, i: number) => (
                  <SectionCard key={m.metric || i}>
                    <div className="p-4 hover:bg-secondary/10 transition-colors">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-sm font-bold">{m.metric}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          m.status === "healthy" ? "text-primary bg-primary/10" :
                          m.status === "elevated" ? "text-amber-400 bg-amber-500/10" :
                          m.status === "critical" ? "text-red-400 bg-red-500/10" :
                          "text-muted-foreground bg-muted"
                        }`}>
                          {m.value}
                        </span>
                      </div>
                      <RiskBar value={m.value} status={m.status} />
                      <p className="text-[11px] text-muted-foreground mt-2.5 leading-relaxed">{m.detail}</p>
                    </div>
                  </SectionCard>
                ))}
              </div>
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
};

/* ── PORTFOLIO INSIGHTS PANEL ── */

const PortfolioInsightsPanel = () => {
  const { data, loading, error, refresh } = useAITool("portfolio");
  if (loading) return <LoadingState message="Analyzing your portfolio..." />;
  if (error) return <ErrorState error={error} onRetry={refresh} />;
  if (!data) return null;

  const holdings = data.holdings || [];
  const recommendations = data.recommendations || [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/30 to-violet-500/5 flex items-center justify-center">
            <PieChart className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold">Portfolio Insights</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">AI-powered analytics</p>
          </div>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs rounded-xl" onClick={() => refresh()}>
          <RefreshCw className="w-3 h-3" />Refresh
        </Button>
      </div>

      {/* Value Cards */}
      <div className="grid grid-cols-2 gap-3">
        <SectionCard>
          <div className="p-4 bg-gradient-to-br from-violet-500/5 to-transparent">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">Portfolio Value</p>
            <p className="text-2xl font-bold">${data.totalValue?.toLocaleString()}</p>
            <p className={`text-xs mt-1 flex items-center gap-1 font-semibold ${data.pnl24h >= 0 ? "text-primary" : "text-destructive"}`}>
              {data.pnl24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {data.pnl24h >= 0 ? "+" : ""}${data.pnl24h?.toFixed(2)} ({data.pnlPercent}%)
            </p>
          </div>
        </SectionCard>
        <SectionCard>
          <div className="p-4 bg-gradient-to-br from-amber-500/5 to-transparent">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">Risk Score</p>
            <p className="text-2xl font-bold">{data.riskScore}<span className="text-sm text-muted-foreground">/100</span></p>
            <p className={`text-xs mt-1 font-semibold ${data.riskScore <= 40 ? "text-primary" : data.riskScore <= 70 ? "text-amber-400" : "text-red-400"}`}>
              {data.riskScore <= 40 ? "Low Risk" : data.riskScore <= 70 ? "Medium Risk" : "High Risk"}
            </p>
          </div>
        </SectionCard>
      </div>

      {/* Holdings */}
      <SectionCard>
        <div className="p-3.5 border-b border-border/30">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />Holdings Breakdown
          </h3>
        </div>
        {holdings.map((h: any, i: number) => {
          const tokenColors: Record<string, string> = {
            ZRA: "from-primary to-emerald-400",
            SOL: "from-violet-500 to-purple-400",
            USDC: "from-blue-500 to-cyan-400",
            BONK: "from-amber-500 to-yellow-400",
            RAY: "from-orange-500 to-red-400",
          };
          return (
            <div key={h.token || i} className="flex items-center justify-between px-4 py-3.5 border-b border-border/10 last:border-0 hover:bg-secondary/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tokenColors[h.token] || "from-muted to-secondary"} flex items-center justify-center text-xs font-bold text-white`}>
                  {h.token?.[0]}
                </div>
                <div>
                  <span className="text-sm font-bold">{h.token}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-16 h-1.5 rounded-full bg-secondary/50 overflow-hidden">
                      <div className="h-full rounded-full bg-primary/50" style={{ width: `${h.allocation}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{h.allocation}%</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">${h.value?.toLocaleString()}</p>
                <p className={`text-[11px] font-semibold ${h.change24h >= 0 ? "text-primary" : "text-destructive"}`}>
                  {h.change24h >= 0 ? "+" : ""}{h.change24h}%
                </p>
              </div>
            </div>
          );
        })}
      </SectionCard>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <SectionCard>
          <div className="p-4 bg-gradient-to-br from-violet-500/5 to-transparent">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />AI Recommendations
            </h3>
            <div className="space-y-2.5">
              {recommendations.map((r: string, i: number) => (
                <div key={i} className="flex items-start gap-2.5 text-xs">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-muted-foreground leading-relaxed">{r}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
};

/* ── DEFI ACADEMY / INSTRUCTOR PANEL ── */

const suggestedQuestions = [
  "What is a DEX and how does it work?",
  "Explain liquidity pools in simple terms",
  "What is staking and how do I earn rewards?",
  "How do I protect my crypto wallet?",
  "What is impermanent loss?",
  "How do gas fees work on Solana?",
];

type InstructorMessage = {
  role: "user" | "ai";
  content: string;
  relatedTopics?: string[];
  difficulty?: string;
  keyTakeaways?: string[];
};

const InstructorPanel = () => {
  const [messages, setMessages] = useState<InstructorMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const askQuestion = async (question: string) => {
    if (!question.trim() || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-hub", {
        body: { tool: "instructor", question },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: data.answer || "I couldn't generate a response. Please try again.",
          relatedTopics: data.relatedTopics || [],
          difficulty: data.difficulty || "beginner",
          keyTakeaways: data.keyTakeaways || [],
        },
      ]);
    } catch (e: any) {
      toast.error(e?.message || "Failed to get response");
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    askQuestion(input);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-cyan-500/5 flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-lg font-display font-bold">DeFi Academy</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">Your personal AI crypto instructor</p>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="space-y-5">
          <SectionCard>
            <div className="p-8 text-center bg-gradient-to-br from-cyan-500/5 via-transparent to-teal-500/5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/10 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-lg font-display font-bold mb-2">Welcome to DeFi Academy</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Ask me anything about cryptocurrency, blockchain, DeFi, trading, or security. I'll explain it in simple terms with real-world examples.
              </p>
            </div>
          </SectionCard>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Lightbulb className="w-3 h-3 text-amber-400" />Popular Questions
            </p>
            <div className="grid gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => askQuestion(q)}
                  className="glass rounded-xl p-3.5 gradient-border text-left text-sm hover:bg-secondary/30 transition-all duration-200 flex items-center justify-between group"
                >
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">{q}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div ref={scrollRef} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 scrollbar-none">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl ${
                msg.role === "user"
                  ? "bg-primary/15 text-foreground p-4 border border-primary/20"
                  : "glass gradient-border p-5"
              }`}>
                {msg.role === "user" ? (
                  <p className="text-sm">{msg.content}</p>
                ) : (
                  <div className="space-y-3">
                    <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed text-muted-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_strong]:text-foreground [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_ul]:text-xs [&_ol]:text-xs [&_p]:text-xs [&_li]:text-muted-foreground [&_code]:text-primary [&_code]:bg-primary/10 [&_code]:px-1 [&_code]:rounded">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    {msg.keyTakeaways && msg.keyTakeaways.length > 0 && (
                      <div className="border-t border-border/20 pt-3">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-primary" />Key Takeaways
                        </p>
                        {msg.keyTakeaways.map((t, j) => (
                          <div key={j} className="flex items-start gap-2 text-xs mb-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{t}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {msg.relatedTopics && msg.relatedTopics.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.relatedTopics.map((topic) => (
                          <button
                            key={topic}
                            onClick={() => askQuestion(`Tell me about ${topic}`)}
                            className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
                          >
                            {topic} →
                          </button>
                        ))}
                      </div>
                    )}
                    {msg.difficulty && (
                      <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        msg.difficulty === "beginner" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" :
                        msg.difficulty === "intermediate" ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" :
                        "bg-red-500/15 text-red-400 border border-red-500/20"
                      }`}>{msg.difficulty}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="glass rounded-2xl p-4 gradient-border">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-cyan-400/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about crypto & DeFi..."
          className="flex-1 bg-secondary/30 border border-border/30 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
          disabled={loading}
        />
        <Button type="submit" size="icon" disabled={!input.trim() || loading} className="rounded-xl shrink-0 glow-sm h-11 w-11">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

/* ── MAIN PAGE ── */

const panelMap: Record<AITool, () => JSX.Element> = {
  assistant: TradingAssistantPanel,
  security: SecurityOptimizationPanel,
  portfolio: PortfolioInsightsPanel,
  instructor: InstructorPanel,
};

const AIHub = () => {
  const [activeTool, setActiveTool] = useState<AITool>("assistant");
  const Panel = panelMap[activeTool];

  return (
    <DexLayout>
      <div className="p-4 max-w-5xl mx-auto">
        {/* Hero Header */}
        <div className="text-center mb-8 relative">
          {/* Background glow */}
          <div className="absolute inset-0 -top-8 bg-gradient-to-b from-primary/5 via-transparent to-transparent rounded-3xl pointer-events-none" />
          
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4 border border-primary/20 glow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Powered by Zyra AI
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
              <span className="text-gradient">AI Trading</span> Suite
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Institutional-grade AI analysis, real-time security monitoring, portfolio intelligence, and interactive DeFi education.
            </p>
          </div>
        </div>

        {/* Tool Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          {tools.map((t) => {
            const active = activeTool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTool(t.id)}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl text-xs font-medium transition-all duration-300 overflow-hidden group ${
                  active
                    ? `bg-gradient-to-br ${t.gradient} ring-1 ring-border shadow-lg ${t.glow}`
                    : "glass hover:bg-secondary/30"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  active ? "bg-background/50 shadow-inner" : "bg-secondary/50"
                }`}>
                  <t.icon className={`w-5 h-5 transition-colors ${active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`} />
                </div>
                <span className={`font-semibold transition-colors text-center ${active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                  <span className="hidden sm:inline">{t.label}</span>
                  <span className="sm:hidden">{t.shortLabel}</span>
                </span>
                <span className="text-[10px] text-muted-foreground hidden md:block">{t.desc}</span>
                {active && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Panel */}
        <div key={activeTool} className="animate-fade-in">
          <Panel />
        </div>
      </div>
    </DexLayout>
  );
};

export default AIHub;
