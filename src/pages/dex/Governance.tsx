import { useState, useEffect } from "react";
import { Vote, Clock, CheckCircle2, XCircle, Loader2, LogIn, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import DexLayout from "@/components/dex/DexLayout";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  active: { label: "Active", icon: Clock, className: "text-primary bg-primary/10" },
  passed: { label: "Passed", icon: CheckCircle2, className: "text-primary bg-primary/10" },
  rejected: { label: "Rejected", icon: XCircle, className: "text-destructive bg-destructive/10" },
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
  const { setVisible } = useWalletModal();
  const { toast } = useToast();

  // Fetch proposals
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("governance_proposals")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setProposals(data);

      // Fetch user votes
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

    // Subscribe to realtime updates
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
      toast({ title: `Vote cast: ${direction}!`, description: "Your vote has been recorded on-chain." });

      // Refresh proposals
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

  return (
    <DexLayout>
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-display font-bold">Governance</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Vote on proposals with your ZRA tokens</p>
          </div>
          {user && connected ? (
            <Button size="sm" className="gap-1.5 glow-sm" onClick={() => setShowCreate(!showCreate)}>
              {showCreate ? <XCircle className="w-3.5 h-3.5" /> : <Vote className="w-3.5 h-3.5" />}
              {showCreate ? "Cancel" : "New Proposal"}
            </Button>
          ) : !user ? (
            <Button size="sm" className="gap-1.5 glow-sm" onClick={() => navigate("/auth")}>
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </Button>
          ) : (
            <Button size="sm" className="gap-1.5 glow-sm" onClick={() => setVisible(true)}>
              Connect Wallet
            </Button>
          )}
        </div>

        {/* Create proposal form */}
        {showCreate && (
          <div className="glass rounded-xl p-4 gradient-border mb-6 animate-in slide-in-from-top-2 duration-200">
            <h3 className="font-semibold text-sm mb-3">Create New Proposal</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Proposal title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-secondary/30 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30"
              />
              <textarea
                placeholder="Description (optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
                className="w-full bg-secondary/30 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/30 resize-none"
              />
              <div className="flex items-center gap-3">
                <label className="text-xs text-muted-foreground">Voting period:</label>
                <select
                  value={newEndDays}
                  onChange={(e) => setNewEndDays(e.target.value)}
                  className="bg-secondary/30 rounded-lg px-3 py-1.5 text-sm outline-none"
                >
                  <option value="3">3 days</option>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                </select>
              </div>
              <Button className="w-full glow-sm" size="sm" disabled={creating || !newTitle.trim()} onClick={handleCreateProposal}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
                {creating ? "Creating..." : "Submit Proposal"}
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
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

              return (
                <div key={p.id} className="glass rounded-xl p-4 gradient-border hover:bg-secondary/20 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground font-mono">{p.proposal_id}</span>
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${config.className}`}>
                          <StatusIcon className="w-3 h-3" />
                          {config.label}
                        </span>
                        {hasVoted && (
                          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">Voted</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm">{p.title}</h3>
                      {p.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>}
                      <p className="text-xs text-muted-foreground mt-0.5">by {p.author_label} · ends {new Date(p.end_date).toLocaleDateString()}</p>
                    </div>
                    {p.status === "active" && user && connected && !hasVoted && (
                      <div className="flex gap-1.5 shrink-0">
                        {isVoting ? (
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        ) : (
                          <>
                            <Button size="sm" variant="outline" className="text-xs h-7 border-primary/20 hover:bg-primary/10 hover:text-primary" onClick={() => handleVote(p.id, "for")}>
                              For
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs h-7 border-destructive/20 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleVote(p.id, "against")}>
                              Against
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Vote bar */}
                  <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${forPct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                    <span className="text-primary">{forPct.toFixed(1)}% For ({(p.votes_for / 1_000_000).toFixed(1)}M)</span>
                    <span className="text-destructive">{(100 - forPct).toFixed(1)}% Against ({(p.votes_against / 1_000_000).toFixed(1)}M)</span>
                  </div>
                </div>
              );
            })}
            {proposals.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Vote className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No proposals yet. Be the first to create one!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DexLayout>
  );
};

export default Governance;
