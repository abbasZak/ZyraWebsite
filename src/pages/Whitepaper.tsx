import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const sections = [
  {
    title: "1. Introduction",
    content: `Zyra is a decentralized cryptocurrency exchange (DEX) designed to provide secure, transparent, and non-custodial digital asset trading for users in Nigeria, across Africa, and globally.

Traditional cryptocurrency exchanges operate under custodial models where users deposit funds into wallets controlled by the exchange. This structure introduces significant risks including security breaches, insolvency exposure, regulatory seizure, and internal mismanagement.

Zyra eliminates these risks by operating through blockchain-based smart contracts that allow users to trade directly from their own wallets while maintaining full control of their private keys. Zyra is designed not only as an exchange, but as a long-term Web3 financial gateway for Africa.`,
  },
  {
    title: "2. Problems",
    content: `**Centralization Risk** — Most exchanges hold user funds in centralized wallets, creating single points of failure, large-scale hacks, exchange insolvency, government shutdowns, and internal fund mismanagement.

**High Trading Fees** — Many exchanges charge trading commissions, withdrawal fees, spread markups, and conversion costs that significantly reduce trader profitability.

**Poor Optimization for African Markets** — Most platforms are designed for Western markets and fail to consider mobile-first internet usage, lower bandwidth environments, regional accessibility, and localized education.

**Lack of Transparency and Trust** — Users often cannot verify exchange reserves, internal trading systems, or governance decisions.`,
  },
  {
    title: "3. Zyra Solutions",
    content: `**Non-Custodial Trading** — Users trade directly from their wallets through smart contracts, ensuring they never lose custody of their assets.

**Lower Fees** — Efficient on-chain infrastructure reduces trading costs, passing savings directly to traders.

**Mobile-First Platform** — The exchange is optimized for emerging market users, built for low-bandwidth environments and mobile devices.

**Transparent Governance** — Zyra introduces DAO-based governance where the community can directly influence protocol decisions.`,
  },
  {
    title: "4. Platform Architecture",
    content: `Zyra utilizes a hybrid on-chain/off-chain matching engine architecture designed to balance performance, scalability, and decentralization.

**Off-Chain Order Matching Layer** — High-speed order matching, low latency execution, and order book management.

**On-Chain Settlement Layer** — Final trade execution via smart contracts with full transparency and auditability.

**Liquidity Layer** — Integrated liquidity pools, market maker participation, and slippage optimization.

**AI-Powered Features** — AI Trading Assistant, Liquidity Optimization, Fraud Detection, Risk Analysis, and Portfolio Insights.`,
  },
  {
    title: "5. ZRA Token",
    content: `ZRA is the native utility token powering the Zyra ecosystem with a fixed total supply of 170,000,000 ZRA.

**Token Utility:** Pay trading fees, fee discounts, DAO governance voting, staking rewards, liquidity incentives, and referral rewards.

**Allocation:** Public Sale (ICO) 40% · Liquidity Mining 30% · Airdrops 15% · Staking Rewards 10% · Referral Rewards 5%

**ICO Pricing:** Presale at $0.20 · ICO Stage 1 at $0.30

**Buyback & Burn:** A defined percentage of protocol-generated revenue will be allocated toward periodic repurchase and permanent removal of ZRA tokens from circulation.`,
  },
  {
    title: "6. Security",
    content: `Security is a foundational priority for Zyra. The platform utilizes SHA-256 cryptographic standards and is developed with post-quantum security awareness.

**Multi-Layer Security Framework:** Smart Contract Audits, Multi-Signature Treasury Management, Penetration Testing, Bug Bounty Programs, and Continuous Monitoring Systems.`,
  },
  {
    title: "7. Legal Disclaimer",
    content: `This whitepaper is for informational purposes only and does not constitute financial, investment, legal, or tax advice. The information contained herein is subject to change without notice. Participation in the Zyra ecosystem involves significant risk, including the potential loss of capital. Prospective participants should conduct their own independent research and consult with qualified professionals before making any decisions.`,
  },
];

const Whitepaper = () => {
  return (
    <div>
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-3xl">
          <Button variant="ghost" className="mb-8" asChild>
            <a href="/"><ArrowLeft className="mr-2 w-4 h-4" /> Back</a>
          </Button>

          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            Zyra <span className="text-gradient">Whitepaper</span>
          </h1>
          <p className="text-muted-foreground mb-12">Version 1.0 · Decentralized Exchange Infrastructure for Africa</p>

          <div className="space-y-12">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-2xl font-bold mb-4 text-primary">{section.title}</h2>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {section.content.split("**").map((part, i) =>
                    i % 2 === 1 ? (
                      <strong key={i} className="text-foreground">{part}</strong>
                    ) : (
                      <span key={i}>{part}</span>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Whitepaper;
