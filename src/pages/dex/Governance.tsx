import { Vote, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import DexLayout from "@/components/dex/DexLayout";

const proposals = [
  {
    id: "ZYP-001",
    title: "Reduce swap fee from 0.3% to 0.25%",
    status: "active" as const,
    votesFor: 1_240_000,
    votesAgainst: 380_000,
    endDate: "Jun 15, 2026",
    author: "Zyra…4x8k",
  },
  {
    id: "ZYP-002",
    title: "Add BONK/ZRA liquidity pool",
    status: "active" as const,
    votesFor: 890_000,
    votesAgainst: 120_000,
    endDate: "Jun 18, 2026",
    author: "Zyra…7m2p",
  },
  {
    id: "ZYP-003",
    title: "Increase staking rewards by 5%",
    status: "passed" as const,
    votesFor: 2_100_000,
    votesAgainst: 450_000,
    endDate: "Jun 1, 2026",
    author: "Zyra…9k1r",
  },
  {
    id: "ZYP-004",
    title: "Treasury allocation for marketing",
    status: "rejected" as const,
    votesFor: 600_000,
    votesAgainst: 1_800_000,
    endDate: "May 28, 2026",
    author: "Zyra…3n5w",
  },
];

const statusConfig = {
  active: { label: "Active", icon: Clock, className: "text-primary bg-primary/10" },
  passed: { label: "Passed", icon: CheckCircle2, className: "text-primary bg-primary/10" },
  rejected: { label: "Rejected", icon: XCircle, className: "text-destructive bg-destructive/10" },
};

const Governance = () => {
  return (
    <DexLayout>
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-display font-bold">Governance</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Vote on proposals with your ZRA tokens</p>
          </div>
          <Button size="sm" className="gap-1.5 glow-sm">
            <Vote className="w-3.5 h-3.5" />
            New Proposal
          </Button>
        </div>

        <div className="space-y-3">
          {proposals.map((p) => {
            const totalVotes = p.votesFor + p.votesAgainst;
            const forPct = (p.votesFor / totalVotes) * 100;
            const config = statusConfig[p.status];
            const StatusIcon = config.icon;

            return (
              <div key={p.id} className="glass rounded-xl p-4 gradient-border hover:bg-secondary/20 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground font-mono">{p.id}</span>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${config.className}`}>
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm">{p.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">by {p.author} · ends {p.endDate}</p>
                  </div>
                  {p.status === "active" && (
                    <div className="flex gap-1.5 shrink-0">
                      <Button size="sm" variant="outline" className="text-xs h-7 border-primary/20 hover:bg-primary/10 hover:text-primary">
                        For
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs h-7 border-destructive/20 hover:bg-destructive/10 hover:text-destructive">
                        Against
                      </Button>
                    </div>
                  )}
                </div>
                {/* Vote bar */}
                <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${forPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                  <span className="text-primary">{forPct.toFixed(1)}% For ({(p.votesFor / 1_000_000).toFixed(1)}M)</span>
                  <span className="text-destructive">{(100 - forPct).toFixed(1)}% Against ({(p.votesAgainst / 1_000_000).toFixed(1)}M)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DexLayout>
  );
};

export default Governance;
