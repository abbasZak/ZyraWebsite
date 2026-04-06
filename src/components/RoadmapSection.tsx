import { motion } from "framer-motion";
import { Check } from "lucide-react";

const phases = [
  { phase: "Phase 0", timeline: "2025", milestone: "ZRA Token Development & Smart Contract Initialization", done: true },
  { phase: "Phase 1", timeline: "June 2026", milestone: "First Presale Launch", done: false },
  { phase: "Phase 2", timeline: "Q3 2026", milestone: "MVP Release", done: false },
  { phase: "Phase 3", timeline: "Q4 2026", milestone: "Public ICO & Token Distribution", done: false },
  { phase: "Phase 4", timeline: "Q4 2026", milestone: "Testnet Launch", done: false },
  { phase: "Phase 5", timeline: "Q1 2027", milestone: "Mainnet Exchange Launch", done: false },
  { phase: "Phase 6", timeline: "Q1–Q2 2027", milestone: "Mobile Apps (iOS & Android)", done: false },
  { phase: "Phase 7", timeline: "Q2 2027", milestone: "DAO Governance Activation", done: false },
  { phase: "Phase 8", timeline: "Q3–Q4 2027", milestone: "Cross-Chain Integration", done: false },
  { phase: "Phase 9", timeline: "2028", milestone: "Advanced AI Trading Systems", done: false },
];

const RoadmapSection = () => {
  return (
    <section id="roadmap" className="py-32 relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/[0.02] blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-medium text-primary uppercase tracking-[0.25em] mb-4">Development Timeline</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 tracking-tight">Roadmap</h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-base md:text-lg">
            From token creation to a full-featured decentralized exchange.
          </p>
        </motion.div>

        <div className="relative max-w-2xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-[19px] md:left-[19px] top-0 bottom-0 w-px bg-border" />

          <div className="space-y-3">
            {phases.map((phase, i) => (
              <motion.div
                key={phase.phase}
                className="relative flex items-start gap-5 pl-0"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                {/* Dot / Check */}
                <div
                  className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    phase.done
                      ? "bg-primary/20 glow-sm"
                      : "bg-secondary border border-border"
                  }`}
                >
                  {phase.done ? (
                    <Check className="w-4 h-4 text-primary" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                  )}
                </div>

                {/* Content */}
                <div
                  className={`flex-1 p-4 rounded-xl transition-all ${
                    phase.done
                      ? "glass gradient-border"
                      : "glass hover:bg-card/60"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">{phase.phase}</span>
                    <span className={`text-xs font-medium tabular-nums ${phase.done ? "text-primary" : "text-muted-foreground"}`}>
                      {phase.timeline} {phase.done && "✓"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{phase.milestone}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoadmapSection;
