import { motion } from "framer-motion";

const tokenAllocation = [
  { category: "Public Sale (ICO)", percentage: 40, amount: "68,000,000", color: "bg-primary" },
  { category: "Liquidity Mining", percentage: 30, amount: "51,000,000", color: "bg-emerald-400" },
  { category: "Airdrops", percentage: 15, amount: "25,500,000", color: "bg-teal-400" },
  { category: "Staking Rewards", percentage: 10, amount: "17,000,000", color: "bg-cyan-400" },
  { category: "Referral Rewards", percentage: 5, amount: "8,500,000", color: "bg-green-300" },
];

const TokenomicsSection = () => {
  return (
    <section id="tokenomics" className="py-32 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/[0.03] blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-medium text-primary uppercase tracking-[0.25em] mb-4">Token Economics</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 tracking-tight">
            <span className="text-gradient">ZRA</span> Tokenomics
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-base md:text-lg">
            Total Supply: <span className="text-foreground font-semibold">170,000,000 ZRA</span> — fixed and deflationary.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Allocation bars */}
          <motion.div
            className="space-y-5 p-6 md:p-8 rounded-2xl glass gradient-border"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">Allocation</h3>
            {tokenAllocation.map((item, i) => (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium text-foreground">{item.category}</span>
                  <span className="text-sm text-muted-foreground tabular-nums">{item.percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${item.color}`}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 tabular-nums">{item.amount} ZRA</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Token utility + pricing */}
          <div className="space-y-5">
            <motion.div
              className="p-6 md:p-8 rounded-2xl glass gradient-border"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-5">Token Utility</h3>
              <ul className="space-y-3">
                {[
                  "Pay trading fees at discounted rates",
                  "DAO governance voting power",
                  "Staking for passive yield",
                  "Liquidity mining incentives",
                  "Referral reward distribution",
                  "Buyback & burn mechanism",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="p-6 md:p-8 rounded-2xl glass gradient-border"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-5">ICO Pricing</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-secondary/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Presale</p>
                  <p className="text-2xl font-bold text-primary font-display">$0.20</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">ICO Stage 1</p>
                  <p className="text-2xl font-bold text-primary font-display">$0.30</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TokenomicsSection;
