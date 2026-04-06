import { motion } from "framer-motion";
import { FileText, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import PresaleCountdown from "@/components/PresaleCountdown";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full bg-primary/[0.04] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/[0.03] blur-[120px] pointer-events-none" />
      
      {/* Floating orbs */}
      <motion.div
        className="absolute top-1/3 left-[15%] w-2 h-2 rounded-full bg-primary/30"
        animate={{ y: [-10, 10, -10], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/4 right-[20%] w-1.5 h-1.5 rounded-full bg-primary/20"
        animate={{ y: [10, -10, 10], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/3 left-[25%] w-1 h-1 rounded-full bg-primary/40"
        animate={{ y: [-8, 8, -8] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto px-6 relative z-10 pt-20">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass border border-primary/10 text-sm font-medium mb-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-muted-foreground">Presale Coming</span>
            <span className="text-primary font-semibold">June 2026</span>
          </motion.div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[5.5rem] font-bold leading-[1.05] mb-8 tracking-tight">
            <span className="text-gradient-subtle">The Future of</span>
            <br />
            <span className="text-gradient">Decentralized</span>
            <br />
            <span className="text-gradient-subtle">Trading in Africa</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-12 leading-relaxed">
            Non-custodial. AI-powered. Built for the next billion users.
          </p>

          {/* Countdown */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <PresaleCountdown />
          </motion.div>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              size="lg"
              className="text-base px-8 h-12 font-semibold glow-sm hover:glow-md transition-shadow"
              asChild
            >
              <a href="#tokenomics">View Tokenomics</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 h-12 font-semibold border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all"
              asChild
            >
              <a href="/whitepaper">
                <FileText className="mr-2 w-4 h-4" />
                Read Whitepaper
              </a>
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mt-24 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          {[
            { label: "Total Supply", value: "170M", suffix: "ZRA" },
            { label: "Presale Price", value: "$0.20", suffix: "" },
            { label: "ICO Stage 1", value: "$0.30", suffix: "" },
            { label: "Architecture", value: "Multi", suffix: "Chain" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center p-4 rounded-xl glass gradient-border"
            >
              <p className="text-xl md:text-2xl font-bold text-foreground">
                {stat.value}
                {stat.suffix && <span className="text-primary text-sm ml-1 font-medium">{stat.suffix}</span>}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="flex justify-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="w-4 h-4 text-muted-foreground/50" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
