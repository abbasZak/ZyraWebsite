import { motion } from "framer-motion";

const tokenAllocation = [
  { category: "Public Sale (ICO)", percentage: 40, amount: "68,000,000", color: "bg-primary" },
  { category: "Liquidity Mining", percentage: 30, amount: "51,000,000", color: "bg-emerald-500" },
  { category: "Airdrops (User Growth)", percentage: 15, amount: "25,500,000", color: "bg-teal-400" },
  { category: "Staking Rewards", percentage: 10, amount: "17,000,000", color: "bg-cyan-500" },
  { category: "Referral Rewards", percentage: 5, amount: "8,500,000", color: "bg-green-300" },
];

const TokenomicsSection = () => {
  return (
    <section id="tokenomics" className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">ZRA</span> Tokenomics
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Total Supply: <span className="text-foreground font-semibold">170,000,000 ZRA</span> — fixed, predictable, and deflationary.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Visual bar chart */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {tokenAllocation.map((item, i) => (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{item.category}</span>
                  <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${item.color}`}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.15 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{item.amount} ZRA</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Token utility */}
          <motion.div
            className="p-8 rounded-xl bg-card border border-border"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-6">Token Utility</h3>
            <ul className="space-y-3">
              {[
                "Pay trading fees at discounted rates",
                "DAO governance voting power",
                "Staking for passive yield",
                "Liquidity mining incentives",
                "Referral reward distribution",
                "Buyback & burn deflationary mechanism",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 p-4 rounded-lg bg-secondary">
              <h4 className="font-semibold mb-2">ICO Pricing</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Presale</p>
                  <p className="text-xl font-bold text-primary">$0.20</p>
                </div>
                <div>
                  <p className="text-muted-foreground">ICO Stage 1</p>
                  <p className="text-xl font-bold text-primary">$0.30</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TokenomicsSection;
