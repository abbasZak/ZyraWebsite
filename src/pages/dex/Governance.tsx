import { useState, useEffect } from "react";
import { Vote, Clock, CheckCircle2, XCircle, Loader2, LogIn, Plus, Users, BarChart3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import DexLayout from "@/components/dex/DexLayout";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

interface Proposal {
  id: string;
  proposal_id: string;
  title: string;
  description: string | null;
  status: string;
  votes_for: number;
  votes_against: number;
  end_date: string;
  author_label: string;
  author_id: string;
}

const statusConfig: Record<string, { label: string; icon: typeof Clock; className: string }> = {
  active: { label: "Active", icon: Clock, className: "text-primary bg-primary/10 border border-primary/20" },
  passed: { label: "Passed", icon: CheckCircle2, className: "text-primary bg-primary/10 border border-primary/20" },
  rejected: { label: "Rejected", icon: XCircle, className: "text-destructive bg-destructive/10 border border-destructive/20" },
};

const Governance = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newEndDays, setNewEndDays] = useState("7");
  const [creating, setCreating] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { connected } = useWallet();
  const { toast } = useToast();
  const { setVisible: openWalletModal } = useWalletModal();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("governance_proposals")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setProposals(data);

      if (user) {
        const { data: votes } = await supabase
          .from("governance_votes")
          .select("proposal_id")
          .eq("user_id", user.id);
        if (votes) setUserVotes(new Set(votes.map((v) => v.proposal_id)));
      }
      setLoading(false);
    };
    fetchData();

    const channel = supabase
      .channel("governance-proposals")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "governance_proposals" }, (payload) => {
        setProposals((prev) => prev.map((p) => (p.id === payload.new.id ? { ...p, ...payload.new } as Proposal : p)));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleVote = async (proposalId: string, direction: "for" | "against") => {
    if (!user || !connected) return;
    if (userVotes.has(proposalId)) {
      toast({ title: "Already voted on this proposal", variant: "destructive" });
      return;
    }

    setVotingId(proposalId);
    try {
      const { error } = await supabase.from("governance_votes").insert({
        user_id: user.id,
        proposal_id: proposalId,
        vote_direction: direction,
        voting_power: 1,
      });

      if (error) {
        if (error.code === "23505") {
          toast({ title: "Already voted", variant: "destructive" });
        } else {
          throw error;
        }
        return;
      }

      setUserVotes((prev) => new Set(prev).add(proposalId));
      toast({ title: `Vote cast: ${direction}! ✅`, description: "Your vote has been recorded." });

      const { data } = await supabase.from("governance_proposals").select("*").order("created_at", { ascending: false });
      if (data) setProposals(data);
    } catch (e: any) {
      toast({ title: "Vote Failed", description: e.message, variant: "destructive" });
    } finally {
      setVotingId(null);
    }
  };

  const handleCreateProposal = async () => {
    if (!user || !newTitle.trim()) return;
    setCreating(true);
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(newEndDays || "7"));
      const proposalNum = proposals.length + 1;

      const { error } = await supabase.from("governance_proposals").insert({
        proposal_id: `ZYP-${String(proposalNum).padStart(3, "0")}`,
        author_id: user.id,
        author_label: user.email?.slice(0, 6) + "…" || "Anon",
        title: newTitle,
        description: newDesc || null,
        status: "active",
        end_date: endDate.toISOString(),
      });

      if (error) throw error;

      toast({ title: "Proposal Created! 🎉" });
      setNewTitle("");
      setNewDesc("");
      setShowCreate(false);

      const { data } = await supabase.from("governance_proposals").select("*").order("created_at", { ascending: false });
      if (data) setProposals(data);
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const totalVoters = proposals.reduce((s, p) => s + p.votes_for + p.votes_against, 0);
  const activeProposals = proposals.filter(p => p.status === "active").length;

  return (
    <DexLayout>
      <div className="p-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center glow-sm">
              <Vote className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold">Governance</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Vote on proposals with your ZRA tokens</p>
            </div>
          </div>
          {user && connected ? (
            <Button size="sm" className="gap-1.5 glow-sm rounded-xl" onClick={() => setShowCreate(!showCreate)}>
              {showCreate ? <XCircle className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showCreate ? "Cancel" : "New Proposal"}
            </Button>
          ) : !user ? (
            <Button size="sm" className="gap-1.5 glow-sm rounded-xl" onClick={() => navigate("/auth")}>
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </Button>
          ) : (
            <Button size="sm" className="gap-1.5 glow-sm rounded-xl" onClick={() => openWalletModal(true)}>
              Connect Wallet
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Proposals", value: String(proposals.length), icon: BarChart3, color: "text-primary" },
            { label: "Active", value: String(activeProposals), icon: Sparkles, color: "text-amber-400" },
            { label: "Total Votes", value: totalVoters.toLocaleString(), icon: Users, color: "text-violet-400" },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl p-3.5 gradient-border">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1 uppercase tracking-widest font-semibold">
                <s.icon className={`w-3 h-3 ${s.color}`} />{s.label}
              </div>
              <p className="text-lg font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Create proposal form */}
        {showCreate && (
          <div className="glass rounded-xl p-5 gradient-border mb-6 animate-fade-in">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />Create New Proposal
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Proposal title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-secondary/30 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 border border-border/30 focus:border-primary/30 transition-all"
              />
              <textarea
                placeholder="Description (optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
                className="w-full bg-secondary/30 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none border border-border/30 focus:border-primary/30 transition-all"
              />
              <div className="flex items-center gap-3">
                <label className="text-xs text-muted-foreground font-semibold">Voting period:</label>
                <select
                  value={newEndDays}
                  onChange={(e) => setNewEndDays(e.target.value)}
                  className="bg-secondary/30 rounded-lg px-3 py-2 text-sm outline-none border border-border/30"
                >
                  <option value="3">3 days</option>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                </select>
              </div>
              <Button className="w-full glow-sm rounded-xl h-11" disabled={creating || !newTitle.trim()} onClick={handleCreateProposal}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Vote className="w-4 h-4 mr-1.5" />}
                {creating ? "Creating..." : "Submit Proposal"}
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading proposals...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {proposals.map((p) => {
              const totalVotes = p.votes_for + p.votes_against;
              const forPct = totalVotes > 0 ? (p.votes_for / totalVotes) * 100 : 50;
              const config = statusConfig[p.status] || statusConfig.active;
              const StatusIcon = config.icon;
              const hasVoted = userVotes.has(p.id);
              const isVoting = votingId === p.id;
              const daysLeft = Math.max(0, Math.ceil((new Date(p.end_date).getTime() - Date.now()) / 86400000));

              return (
                <div key={p.id} className="glass rounded-xl gradient-border hover:bg-secondary/10 transition-all duration-300 overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-[10px] text-muted-foreground font-mono bg-secondary/50 px-1.5 py-0.5 rounded">{p.proposal_id}</span>
                          <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${config.className}`}>
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                          </span>
                          {hasVoted && (
                            <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-bold border border-primary/20">✓ Voted</span>
                          )}
                        </div>
                        <h3 className="font-bold text-sm">{p.title}</h3>
                        {p.description && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{p.description}</p>}
                        <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-2">
                          <span>by {p.author_label}</span>
                          <span>·</span>
                          <span className={daysLeft <= 1 ? "text-destructive font-semibold" : ""}>
                            {daysLeft > 0 ? `${daysLeft}d left` : "Ended"}
                          </span>
                        </p>
                      </div>
                      {p.status === "active" && user && connected && !hasVoted && (
                        <div className="flex gap-1.5 shrink-0">
                          {isVoting ? (
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          ) : (
                            <>
                              <Button size="sm" variant="outline" className="text-xs h-8 px-3 border-primary/20 hover:bg-primary/10 hover:text-primary rounded-lg font-semibold" onClick={() => handleVote(p.id, "for")}>
                                ✓ For
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs h-8 px-3 border-destructive/20 hover:bg-destructive/10 hover:text-destructive rounded-lg font-semibold" onClick={() => handleVote(p.id, "against")}>
                                ✗ Against
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Vote bar */}
                    <div className="h-2.5 rounded-full bg-secondary/50 overflow-hidden flex">
                      <div className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-700" style={{ width: `${forPct}%` }} />
                      <div className="h-full bg-gradient-to-r from-red-500 to-destructive transition-all duration-700 flex-1" />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                      <span className="text-primary font-semibold">{forPct.toFixed(1)}% For ({totalVotes > 0 ? p.votes_for.toLocaleString() : "0"} votes)</span>
                      <span className="text-destructive font-semibold">{(100 - forPct).toFixed(1)}% Against ({totalVotes > 0 ? p.votes_against.toLocaleString() : "0"} votes)</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {proposals.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-secondary/30 flex items-center justify-center mx-auto mb-4">
                  <Vote className="w-7 h-7 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">No proposals yet</p>
                <p className="text-xs text-muted-foreground/70">Be the first to create one!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DexLayout>
  );
};

export default Governance;
