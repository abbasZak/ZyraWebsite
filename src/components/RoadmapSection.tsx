import { motion } from "framer-motion";

const phases = [
  { phase: "Phase 0", timeline: "2025 ✓", milestone: "ZRA Token Development & Smart Contract Initialization", done: true },
  { phase: "Phase 1", timeline: "June 2026", milestone: "First Presale Launch", done: false },
  { phase: "Phase 2", timeline: "Q3 2026", milestone: "MVP (Minimum Viable Product) Release", done: false },
  { phase: "Phase 3", timeline: "Q4 2026", milestone: "Public ICO & Token Distribution Event", done: false },
  { phase: "Phase 4", timeline: "Q4 2026", milestone: "Testnet Launch", done: false },
  { phase: "Phase 5", timeline: "Q1 2027", milestone: "Mainnet Exchange Launch", done: false },
  { phase: "Phase 6", timeline: "Q1–Q2 2027", milestone: "Mobile Applications (iOS & Android)", done: false },
  { phase: "Phase 7", timeline: "Q2 2027", milestone: "DAO Governance Activation", done: false },
  { phase: "Phase 8", timeline: "Q3–Q4 2027", milestone: "Cross-Chain Integration & Liquidity Expansion", done: false },
  { phase: "Phase 9", timeline: "2028", milestone: "Advanced AI Trading & Automation Systems", done: false },
];

const RoadmapSection = () => {
  return (
    <section id="roadmap" className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Roadmap</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            From token creation to a full-featured decentralized exchange.
          </p>
        </motion.div>

        <div className="relative max-w-3xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />

          {phases.map((phase, i) => (
            <motion.div
              key={phase.phase}
              className={`relative flex items-start gap-6 mb-8 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} md:text-${i % 2 === 0 ? "right" : "left"}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <div className={`flex-1 hidden md:block ${i % 2 === 0 ? "pr-8" : "pl-8"}`}>
                <div className={`p-4 rounded-lg bg-card border ${phase.done ? "border-primary/50" : "border-border"}`}>
                  <p className="text-sm text-primary font-medium">{phase.timeline}</p>
                  <p className="font-semibold">{phase.phase}</p>
                  <p className="text-sm text-muted-foreground">{phase.milestone}</p>
                </div>
              </div>

              {/* Dot */}
              <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background z-10 mt-5" />

              <div className={`flex-1 hidden md:block ${i % 2 === 0 ? "pl-8" : "pr-8"}`} />

              {/* Mobile view */}
              <div className="pl-10 md:hidden">
                <div className={`p-4 rounded-lg bg-card border ${phase.done ? "border-primary/50" : "border-border"}`}>
                  <p className="text-sm text-primary font-medium">{phase.timeline}</p>
                  <p className="font-semibold">{phase.phase}</p>
                  <p className="text-sm text-muted-foreground">{phase.milestone}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoadmapSection;
