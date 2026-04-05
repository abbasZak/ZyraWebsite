import { motion } from "framer-motion";
import { Shield, Zap, Smartphone, Users, Brain, Coins } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Non-Custodial Trading",
    description: "Trade directly from your wallet. Your keys, your crypto — always.",
  },
  {
    icon: Zap,
    title: "Lower Fees",
    description: "Efficient on-chain infrastructure reduces costs, passing savings to traders.",
  },
  {
    icon: Smartphone,
    title: "Mobile-First",
    description: "Built for emerging markets — optimized for mobile and low-bandwidth environments.",
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
    title: "Cross-Chain (Coming)",
    description: "Seamless multi-chain trading and liquidity expansion across networks.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why <span className="text-gradient">Zyra</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            A decentralized exchange built for Africa and the world — combining security, speed, and accessibility.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group p-6 rounded-xl bg-card border border-border hover:border-glow transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
