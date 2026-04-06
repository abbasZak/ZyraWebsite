import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import PresaleCountdown from "@/components/PresaleCountdown";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grid">
      {/* Glow orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            Presale Coming June 2026
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6 tracking-tight">
            Decentralized
            <br />
            Exchange for{" "}
            <span className="text-gradient">Africa</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Zyra is a non-custodial DEX built for emerging markets. Trade directly from your wallet with lower fees, AI-powered tools, and community governance.
          </p>

          <div className="mb-8">
            <PresaleCountdown />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6 font-semibold" asChild>
              <a href="#tokenomics">View Tokenomics</a>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 font-semibold border-border" asChild>
              <a href="/whitepaper">
                <FileText className="mr-2 w-5 h-5" />
                Read Whitepaper
              </a>
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {[
            { label: "Total Supply", value: "170M ZRA" },
            { label: "Presale Price", value: "$0.20" },
            { label: "ICO Price", value: "$0.30" },
            { label: "Chains", value: "Multi-Chain" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
