import { useState, useEffect, useCallback, useRef } from "react";
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
  Loader2,
  GraduationCap,
  Send,
  BookOpen,
  Lightbulb,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DexLayout from "@/components/dex/DexLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AITool = "assistant" | "security" | "portfolio" | "instructor";

const tools: { id: AITool; label: string; icon: typeof Brain; desc: string; gradient: string }[] = [
  { id: "assistant", label: "Trading Assistant", icon: Brain, desc: "AI-powered market signals", gradient: "from-primary/20 to-primary/5" },
  { id: "security", label: "Security & Optimization", icon: Shield, desc: "Liquidity, fraud & risk", gradient: "from-amber-500/20 to-amber-500/5" },
  { id: "portfolio", label: "Portfolio Insights", icon: PieChart, desc: "Performance analytics", gradient: "from-violet-500/20 to-violet-500/5" },
  { id: "instructor", label: "DeFi Academy", icon: GraduationCap, desc: "Learn crypto & DeFi", gradient: "from-emerald-500/20 to-emerald-500/5" },
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

/* ── Subcomponents ── */

const SignalBadge = ({ signal }: { signal: string }) => {
  const colors: Record<string, string> = {
    "Strong Buy": "bg-primary/15 text-primary",
    Buy: "bg-primary/10 text-primary/80",
    Hold: "bg-muted text-muted-foreground",
    Sell: "bg-destructive/15 text-destructive",
    "Strong Sell": "bg-destructive/20 text-destructive",
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
  const color = status === "healthy" ? "bg-primary" : status === "elevated" ? "bg-amber-500" : status === "critical" ? "bg-red-500" : "bg-muted-foreground";
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

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-16 gap-3">
    <Loader2 className="w-8 h-8 text-primary animate-spin" />
    <p className="text-sm text-muted-foreground">AI is analyzing market data...</p>
  </div>
);

const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3">
    <AlertTriangle className="w-8 h-8 text-destructive" />
    <p className="text-sm text-destructive">{error}</p>
    <Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>
  </div>
);

/* ── Panels ── */

const TradingAssistantPanel = () => {
  const { data, loading, error, refresh } = useAITool("assistant");
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={refresh} />;
  if (!data) return null;

  const signals = data.signals || [];
  const perf = data.modelPerformance || {};

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-display font-bold flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />AI Trading Assistant
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Powered by Zyra AI · Live analysis</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => refresh()}>
          <RefreshCw className="w-3 h-3" />Refresh
        </Button>
      </div>
      <div className="grid gap-3">
        {signals.map((s: any) => (
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
      {perf && (
        <div className="glass rounded-xl p-4 gradient-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-primary" />Model Performance
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-xl font-bold text-primary">{perf.accuracy}%</p><p className="text-[10px] text-muted-foreground">Accuracy</p></div>
            <div><p className="text-xl font-bold text-foreground">{perf.signalsGenerated?.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Signals</p></div>
            <div><p className="text-xl font-bold text-primary">+{perf.avgReturn}%</p><p className="text-[10px] text-muted-foreground">Avg Return</p></div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Merged Security & Optimization Panel ── */

const SecurityOptimizationPanel = () => {
  const liquidity = useAITool("liquidity");
  const fraud = useAITool("fraud");
  const risk = useAITool("risk");

  const anyLoading = liquidity.loading || fraud.loading || risk.loading;

  const refreshAll = () => {
    liquidity.refresh();
    fraud.refresh();
    risk.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-display font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />Security & Optimization
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Liquidity, fraud detection & risk analysis combined</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] text-primary font-semibold">Live</span>
          </div>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={refreshAll} disabled={anyLoading}>
            <RefreshCw className={`w-3 h-3 ${anyLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="liquidity" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="liquidity" className="text-xs gap-1.5"><Droplets className="w-3 h-3" />Liquidity</TabsTrigger>
          <TabsTrigger value="fraud" className="text-xs gap-1.5"><Shield className="w-3 h-3" />Fraud</TabsTrigger>
          <TabsTrigger value="risk" className="text-xs gap-1.5"><AlertTriangle className="w-3 h-3" />Risk</TabsTrigger>
        </TabsList>

        {/* Liquidity Tab */}
        <TabsContent value="liquidity">
          {liquidity.loading ? <LoadingState /> :
           liquidity.error ? <ErrorState error={liquidity.error} onRetry={() => liquidity.refresh()} /> :
           liquidity.data ? (
            <div className="space-y-4">
              <div className="glass rounded-xl overflow-hidden gradient-border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/30 text-muted-foreground">
                      <th className="text-left py-3 px-4 font-medium">Pool</th>
                      <th className="text-right py-3 px-4 font-medium">APR</th>
                      <th className="text-right py-3 px-4 font-medium hidden sm:table-cell">Current</th>
                      <th className="text-right py-3 px-4 font-medium">Optimal</th>
                      <th className="text-right py-3 px-4 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(liquidity.data.pools || []).map((p: any) => (
                      <tr key={p.pool} className="border-b border-border/10 hover:bg-secondary/20 transition-colors">
                        <td className="py-3 px-4 font-semibold">{p.pool}</td>
                        <td className="text-right py-3 px-4 text-primary font-medium">{p.currentAPR}%</td>
                        <td className="text-right py-3 px-4 text-muted-foreground hidden sm:table-cell">{p.currentAlloc}%</td>
                        <td className="text-right py-3 px-4 font-semibold">{p.optimalAlloc}%</td>
                        <td className="text-right py-3 px-4">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.action === "Increase" ? "bg-primary/15 text-primary" : p.action === "Decrease" ? "bg-amber-500/15 text-amber-400" : "bg-muted text-muted-foreground"}`}>
                            {p.action}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {liquidity.data.summary && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass rounded-xl p-4 gradient-border text-center">
                    <p className="text-2xl font-bold text-blue-400">{liquidity.data.summary.estimatedSlippageReduction || "N/A"}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Slippage Reduction</p>
                  </div>
                  <div className="glass rounded-xl p-4 gradient-border text-center">
                    <p className="text-2xl font-bold text-primary">+{liquidity.data.summary.projectedAPRGain || "N/A"}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">APR Gain</p>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </TabsContent>

        {/* Fraud Tab */}
        <TabsContent value="fraud">
          {fraud.loading ? <LoadingState /> :
           fraud.error ? <ErrorState error={fraud.error} onRetry={() => fraud.refresh()} /> :
           fraud.data ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="glass rounded-xl p-3 gradient-border text-center">
                  <p className="text-xl font-bold text-foreground">{fraud.data.stats?.txScanned?.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">TX Scanned (1h)</p>
                </div>
                <div className="glass rounded-xl p-3 gradient-border text-center">
                  <p className="text-xl font-bold text-amber-400">{fraud.data.stats?.flagged}</p>
                  <p className="text-[10px] text-muted-foreground">Flagged</p>
                </div>
                <div className="glass rounded-xl p-3 gradient-border text-center">
                  <p className="text-xl font-bold text-red-400">{fraud.data.stats?.blocked}</p>
                  <p className="text-[10px] text-muted-foreground">Blocked</p>
                </div>
              </div>
              <div className="space-y-2">
                {(fraud.data.alerts || []).map((a: any, i: number) => (
                  <div key={a.id || i} className="glass rounded-xl p-3 gradient-border flex items-center justify-between gap-3 hover:bg-secondary/20 transition-colors">
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
          ) : null}
        </TabsContent>

        {/* Risk Tab */}
        <TabsContent value="risk">
          {risk.loading ? <LoadingState /> :
           risk.error ? <ErrorState error={risk.error} onRetry={() => risk.refresh()} /> :
           risk.data ? (
            <div className="space-y-4">
              <div className="glass rounded-xl p-4 gradient-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overall Risk Level</span>
                  <span className={`text-sm font-bold ${
                    risk.data.overallLevel === "Low" ? "text-primary" :
                    risk.data.overallLevel === "Moderate" ? "text-amber-400" :
                    risk.data.overallLevel === "High" ? "text-red-400" : "text-red-500"
                  }`}>{risk.data.overallLevel}</span>
                </div>
                <div className="w-full bg-secondary/50 rounded-full h-3 overflow-hidden">
                  <div className="h-3 rounded-full bg-gradient-to-r from-primary via-amber-500 to-red-500 transition-all" style={{ width: `${risk.data.overallPercent || 50}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>Low</span><span>Moderate</span><span>High</span><span>Extreme</span>
                </div>
              </div>
              <div className="space-y-3">
                {(risk.data.metrics || []).map((m: any, i: number) => (
                  <div key={m.metric || i} className="glass rounded-xl p-4 gradient-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">{m.metric}</span>
                      <span className={`text-xs font-bold ${m.status === "healthy" ? "text-primary" : m.status === "elevated" ? "text-amber-400" : m.status === "critical" ? "text-red-400" : "text-muted-foreground"}`}>
                        {m.value}
                      </span>
                    </div>
                    <RiskBar value={m.value} status={m.status} />
                    <p className="text-[11px] text-muted-foreground mt-2">{m.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const PortfolioInsightsPanel = () => {
  const { data, loading, error, refresh } = useAITool("portfolio");
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={refresh} />;
  if (!data) return null;

  const holdings = data.holdings || [];
  const recommendations = data.recommendations || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-display font-bold flex items-center gap-2">
            <PieChart className="w-5 h-5 text-violet-400" />Portfolio Insights
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">AI-powered portfolio analytics</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => refresh()}>
          <RefreshCw className="w-3 h-3" />Refresh
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-xl p-4 gradient-border">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Portfolio Value</p>
          <p className="text-xl font-bold">${data.totalValue?.toLocaleString()}</p>
          <p className={`text-xs mt-0.5 flex items-center gap-1 ${data.pnl24h >= 0 ? "text-primary" : "text-destructive"}`}>
            {data.pnl24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {data.pnl24h >= 0 ? "+" : ""}${data.pnl24h?.toFixed(2)} ({data.pnlPercent}%)
          </p>
        </div>
        <div className="glass rounded-xl p-4 gradient-border">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Risk Score</p>
          <p className="text-xl font-bold">{data.riskScore}<span className="text-xs text-muted-foreground">/100</span></p>
          <p className={`text-xs mt-0.5 ${data.riskScore <= 40 ? "text-primary" : data.riskScore <= 70 ? "text-amber-400" : "text-red-400"}`}>
            {data.riskScore <= 40 ? "Low Risk" : data.riskScore <= 70 ? "Medium Risk" : "High Risk"}
          </p>
        </div>
      </div>
      <div className="glass rounded-xl overflow-hidden gradient-border">
        <div className="p-3 border-b border-border/30">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-3 h-3" />Holdings Breakdown
          </h3>
        </div>
        {holdings.map((h: any, i: number) => (
          <div key={h.token || i} className="flex items-center justify-between px-4 py-3 border-b border-border/10 last:border-0 hover:bg-secondary/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">{h.token?.[0]}</div>
              <div>
                <span className="text-sm font-semibold">{h.token}</span>
                <p className="text-[10px] text-muted-foreground">{h.allocation}% of portfolio</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">${h.value?.toLocaleString()}</p>
              <p className={`text-[11px] ${h.change24h >= 0 ? "text-primary" : "text-destructive"}`}>
                {h.change24h >= 0 ? "+" : ""}{h.change24h}%
              </p>
            </div>
          </div>
        ))}
      </div>
      {recommendations.length > 0 && (
        <div className="glass rounded-xl p-4 gradient-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-violet-400" />AI Recommendations
          </h3>
          <div className="space-y-2">
            {recommendations.map((r: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── DeFi Academy / Instructor Panel ── */

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
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-display font-bold flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-emerald-400" />DeFi Academy
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">Your personal AI instructor for crypto & DeFi</p>
      </div>

      {messages.length === 0 ? (
        <div className="space-y-4">
          <div className="glass rounded-xl p-6 gradient-border text-center">
            <BookOpen className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold mb-1">Welcome to DeFi Academy</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Ask me anything about cryptocurrency, blockchain, DeFi, trading, or security. I'll explain it in simple terms with real examples.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Lightbulb className="w-3 h-3 text-amber-400" />Popular Questions
            </p>
            <div className="grid gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => askQuestion(q)}
                  className="glass rounded-xl p-3 gradient-border text-left text-sm hover:bg-secondary/30 transition-colors flex items-center justify-between group"
                >
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">{q}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div ref={scrollRef} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 scrollbar-none">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-xl p-4 ${
                msg.role === "user"
                  ? "bg-primary/15 text-foreground"
                  : "glass gradient-border"
              }`}>
                {msg.role === "user" ? (
                  <p className="text-sm">{msg.content}</p>
                ) : (
                  <div className="space-y-3">
                    <div className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">{msg.content}</div>
                    {msg.keyTakeaways && msg.keyTakeaways.length > 0 && (
                      <div className="border-t border-border/20 pt-3">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-primary" />Key Takeaways
                        </p>
                        {msg.keyTakeaways.map((t, j) => (
                          <div key={j} className="flex items-start gap-2 text-xs mb-1">
                            <CheckCircle2 className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                            <span>{t}</span>
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
                            className="text-[10px] font-medium px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            {topic} →
                          </button>
                        ))}
                      </div>
                    )}
                    {msg.difficulty && (
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        msg.difficulty === "beginner" ? "bg-emerald-500/15 text-emerald-400" :
                        msg.difficulty === "intermediate" ? "bg-amber-500/15 text-amber-400" :
                        "bg-red-500/15 text-red-400"
                      }`}>{msg.difficulty}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="glass rounded-xl p-4 gradient-border">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
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
          className="flex-1 bg-secondary/50 border border-border/30 rounded-xl px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
          disabled={loading}
        />
        <Button type="submit" size="icon" disabled={!input.trim() || loading} className="rounded-xl shrink-0 glow-sm">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

/* ── Main page ── */

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
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <Sparkles className="w-3 h-3" />Powered by Zyra AI
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">AI Trading Suite</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            AI-powered market analysis, security monitoring, and DeFi education — all in one place.
          </p>
        </div>

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

        <div className="animate-in fade-in-50 duration-300">
          <Panel />
        </div>
      </div>
    </DexLayout>
  );
};

export default AIHub;
