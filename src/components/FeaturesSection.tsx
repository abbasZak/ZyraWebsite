import { motion } from "framer-motion";
import { Shield, Zap, Smartphone, Users, Brain, Coins } from "lucide-react";
import { type LucideIcon } from "lucide-react";

const features: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Shield,
    title: "Non-Custodial",
    description: "Trade directly from your wallet. Your keys, your crypto — always under your control.",
  },
  {
    icon: Zap,
    title: "Lower Fees",
    description: "Efficient on-chain infrastructure reduces costs and passes savings to traders.",
  },
  {
    icon: Smartphone,
    title: "Mobile-First",
    description: "Optimized for emerging markets — built for mobile and low-bandwidth environments.",
  },
  {
    icon: Users,
    title: "DAO Governance",
    description: "Community-driven decisions. ZRA holders vote on protocol upgrades and direction.",
  },
  {
    icon: Brain,
    title: "AI Trading Tools",
    description: "Market insights, liquidity optimization, fraud detection, and portfolio analytics.",
  },
  {
    icon: Coins,
    title: "Cross-Chain",
    description: "Seamless multi-chain trading and liquidity expansion across networks.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-32 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-0 w-[300px] h-[500px] bg-primary/[0.02] blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-medium text-primary uppercase tracking-[0.25em] mb-4">Core Features</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 tracking-tight">
            Why <span className="text-gradient">Zyra</span>?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-base md:text-lg leading-relaxed">
            A decentralized exchange built for Africa and the world.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group relative p-6 md:p-8 rounded-2xl glass gradient-border hover:bg-card/80 transition-all duration-500"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 group-hover:glow-sm transition-all duration-500">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 tracking-tight">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
