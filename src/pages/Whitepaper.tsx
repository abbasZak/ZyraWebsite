import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const sections = [
  {
    title: "1. Introduction",
    content: `Zyra is a decentralized cryptocurrency exchange (DEX) designed to provide secure, transparent, and non-custodial digital asset trading for users in Nigeria, across Africa, and globally.

Traditional cryptocurrency exchanges operate under custodial models where users deposit funds into wallets controlled by the exchange. This structure introduces significant risks including security breaches, insolvency exposure, regulatory seizure, and internal mismanagement.

Zyra eliminates these risks by operating through blockchain-based smart contracts that allow users to trade directly from their own wallets while maintaining full control of their private keys.

The goal of Zyra is to build a secure, scalable, and community-driven decentralized trading infrastructure that enables individuals in emerging markets to access global digital financial systems without relying on centralized intermediaries.

Zyra is designed not only as an exchange, but as a long-term Web3 financial gateway for Africa.`,
  },
  {
    title: "2. Problems",
    subsections: [
      {
        subtitle: "2.1 Centralization Risk",
        content: `Most exchanges hold user funds in centralized wallets, creating risks such as:`,
        bullets: [
          "Single points of failure",
          "Large-scale hacks",
          "Exchange insolvency",
          "Government shutdowns",
          "Internal fund mismanagement",
        ],
        afterBullets: "Users must trust the exchange operator rather than cryptographic guarantees.",
      },
      {
        subtitle: "2.2 High Trading Fees",
        content: `Many exchanges charge multiple fees including:`,
        bullets: [
          "Trading commissions",
          "Withdrawal fees",
          "Spread markups",
          "Conversion costs",
        ],
        afterBullets: "These fees significantly reduce trader profitability.",
      },
      {
        subtitle: "2.3 Poor Optimization for African Markets",
        content: `Most platforms are designed for Western markets and fail to consider:`,
        bullets: [
          "Mobile-first internet usage",
          "Lower bandwidth environments",
          "Regional accessibility",
          "Localized education and onboarding",
        ],
        afterBullets: "This slows adoption across emerging markets.",
      },
      {
        subtitle: "2.4 Lack of Transparency and Trust",
        content: `Users often cannot verify exchange reserves, internal trading systems, or governance decisions. This lack of transparency creates distrust in crypto platforms.`,
      },
    ],
  },
  {
    title: "3. Zyra Solutions",
    content: `Zyra addresses these problems through a decentralized and transparent exchange architecture.`,
    features: [
      { name: "Non-Custodial Trading", desc: "Users trade directly from their wallets through smart contracts, ensuring they never lose custody of their assets." },
      { name: "Lower Fees", desc: "Efficient on-chain infrastructure reduces trading costs, passing savings directly to traders." },
      { name: "Mobile-First Platform", desc: "The exchange is optimized for emerging market users, built for low-bandwidth environments and mobile devices." },
      { name: "Transparent Governance", desc: "Zyra introduces DAO-based governance where the community can directly influence protocol decisions." },
    ],
  },
  {
    title: "4. Zyra Platform",
    content: `**What Zyra Is**

Zyra is a decentralized digital asset exchange protocol that enables peer-to-peer cryptocurrency trading without centralized custody. The platform provides:
• Non-custodial trading
• Smart contract execution
• Community governance
• Tokenized incentive structures

**Matching Engine**

Zyra utilizes a hybrid on-chain/off-chain matching engine architecture designed to balance performance, scalability, and decentralization.

**Off-Chain Order Matching Layer**
• High-speed order matching
• Low latency execution
• Order book management

**On-Chain Settlement Layer**
• Final trade execution via smart contracts
• Full transparency and auditability
• Non-custodial asset transfers

**Liquidity Layer**
• Integrated liquidity pools
• Market maker participation
• Slippage optimization

This hybrid design enables Zyra to achieve CEX-level performance while maintaining DEX-level security and transparency.

**Core Features**

Zyra will support several features including:
• Spot trading
• Liquidity pools
• Staking and yield mechanisms
• Referral reward system
• DAO governance voting
• AI trading tools
• Cross-chain integration (future)

**AI-Powered Features**

Zyra integrates artificial intelligence to improve user experience and market efficiency.

• **AI Trading Assistant** — Provides market insights and trade suggestions based on real-time data analysis.
• **AI Liquidity Optimization** — Helps optimize liquidity distribution across pools to reduce slippage.
• **AI Fraud Detection** — Monitors suspicious transaction patterns to protect users.
• **AI Risk Analysis** — Identifies abnormal market behavior and warns traders proactively.
• **AI Portfolio Insights** — Provides personalized portfolio analytics and performance tracking.

**Coin Listings**

Zyra will initially support major cryptocurrencies including:
• BTC — Bitcoin
• ETH — Ethereum
• USDT — Tether
• BNB — Binance Coin
• ZRA — Zyra Token

Additional tokens may be listed based on security, liquidity, and community demand.

**Device Coverage**

Zyra will be accessible through:
• Web trading platform
• Android application
• iOS application
• Mobile browser interface
• Public API for developers

**Multilingual Support**

The platform will initially support English, French, and Arabic. Additional regional languages may be added as the ecosystem expands.`,
  },
  {
    title: "4.1 Revenue Model",
    table: {
      headers: ["Revenue Source", "Description"],
      rows: [
        ["Trading Fees", "Small fee per transaction"],
        ["Listing Fees", "Token listing services"],
        ["Staking Services", "Ecosystem participation"],
        ["Other Sources", "Additional revenue models to be adopted over time"],
      ],
    },
  },
  {
    title: "4.2 Risk Factors",
    content: `Participation in the Zyra ecosystem involves the following risks:`,
    bullets: [
      "Market Risk: Cryptocurrency price volatility",
      "Regulatory Risk: Changing legal frameworks across jurisdictions",
      "Technology Risk: Smart contract vulnerabilities or exploits",
      "Adoption Risk: Slower-than-expected user growth",
      "Liquidity Risk: Insufficient trading volume in early stages",
    ],
    afterBullets: "Zyra actively works to mitigate these risks through security audits, phased deployment, and ecosystem incentives.",
  },
  {
    title: "5. Zyra Token (ZRA)",
    content: `ZRA is the native utility token powering the Zyra ecosystem. The total supply of ZRA is fixed at:

**170,000,000 ZRA**

This fixed supply model ensures predictability, scarcity, and long-term alignment between platform growth and token value.

**Token Utility**

ZRA will be used for:
• Paying trading fees
• Fee discounts on the exchange
• DAO governance voting
• Staking rewards
• Liquidity incentives
• Referral rewards`,
    tokenTable: {
      headers: ["Allocation Category", "Percentage (%)", "Token Amount (ZRA)"],
      rows: [
        ["Public Sale (ICO)", "40%", "68,000,000"],
        ["Liquidity Mining", "30%", "51,000,000"],
        ["Airdrops (User Growth)", "15%", "25,500,000"],
        ["Staking Rewards", "10%", "17,000,000"],
        ["Referral Rewards", "5%", "8,500,000"],
        ["Total Supply", "100%", "170,000,000"],
      ],
    },
    afterTable: `**ICO**

The Zyra token (ZRA) will be distributed through an Initial Coin Offering (ICO), which serves as a key mechanism for bootstrapping ecosystem development, liquidity provisioning, and platform growth.

During this phase, participants will have the opportunity to acquire ZRA tokens prior to the public launch of the Zyra exchange, enabling early involvement in the ecosystem.

The ICO will offer up to 100,000,000 ZRA tokens and will be conducted on a first-come, first-served basis. Participants may contribute using:
• Ethereum (ETH)
• Bitcoin (BTC)
• Tether (USDT)

Participants will receive their allocated ZRA tokens following the completion of the token sale, in accordance with the distribution schedule defined by the platform.`,
    pricingTable: {
      headers: ["Phase", "Price (USD)", "Description"],
      rows: [
        ["Presale", "$0.20", "Initial offering phase for early supporters with priority access"],
        ["ICO Stage 1", "$0.30", "First public sale phase with increased valuation"],
        ["Public Listing", "Market Price", "Token becomes freely tradable based on market demand"],
      ],
    },
    afterPricing: `**Token Buyback & Burn Mechanism**

Zyra implements a structured buyback and burn mechanism designed to align token value with the long-term growth and performance of the exchange.

A defined percentage of protocol-generated revenue will be allocated toward the periodic repurchase of ZRA tokens from the open market. These tokens will then be permanently removed from circulation (burned).

This mechanism is intended to:
• Systematically reduce circulating supply over time
• Introduce deflationary pressure on the token economy
• Strengthen long-term value alignment between the protocol and token holders
• Directly link exchange performance to token scarcity and demand dynamics

All buyback and burn activities will be conducted transparently and verifiably on-chain.

**Token Mining & Distribution Mechanisms**

In addition to the token sale, ZRA tokens are distributed through active participation within the Zyra ecosystem, ensuring a fair and decentralized ownership model. Users can earn ZRA through:
• Liquidity Mining — Providing liquidity to trading pools and supporting market depth
• Staking Rewards — Locking tokens to earn passive yield and support network stability
• Community Participation — Engaging in ecosystem activities, campaigns, and growth initiatives
• Referral Incentives — Inviting new users and contributing to platform adoption

This multi-layered distribution model ensures that token ownership is not only acquired through capital, but also through contribution, participation, and ecosystem support.`,
  },
  {
    title: "6. Security",
    content: `Security is a foundational priority for Zyra. As a decentralized financial infrastructure platform, the protection of user assets, smart contract integrity, and operational reliability is critical to maintaining trust and long-term ecosystem stability.

**Cryptographic Standards**

At the protocol level, Zyra utilizes established cryptographic standards including SHA-256 hashing, one of the most widely adopted and trusted cryptographic algorithms in modern blockchain systems. SHA-256 plays a critical role in ensuring data integrity, transaction verification, and secure hashing processes within decentralized networks.

**Post-Quantum Security**

Zyra is being developed with post-quantum security awareness in mind. As advances in quantum computing continue to evolve, Zyra's long-term security roadmap considers the integration of post-quantum cryptographic standards and quantum-resistant algorithms as the technology matures and industry standards become widely adopted.

**Multi-Layer Security Framework**

• **Smart Contract Audits** — All core smart contracts undergo independent third-party security audits prior to deployment. Continuous code reviews and formal testing procedures help ensure secure execution and protocol integrity.

• **Multi-Signature Treasury Management** — Protocol treasury operations are secured through multi-signature authorization mechanisms, preventing any single entity from unilaterally controlling or transferring funds.

• **Penetration Testing and Infrastructure Hardening** — Zyra infrastructure is periodically subjected to penetration testing and security assessments designed to identify potential vulnerabilities and strengthen network defenses.

• **Bug Bounty Programs** — The platform encourages independent security researchers and developers to identify vulnerabilities through structured bug bounty initiatives.

• **Continuous Monitoring Systems** — Automated monitoring tools analyze network activity, smart contract interactions, and transaction patterns in real time to detect abnormal or potentially malicious behavior.`,
  },
  {
    title: "7. Market Competition",
    content: `The global cryptocurrency exchange market is one of the most competitive sectors within the blockchain industry. Exchanges serve as the primary gateway through which users access digital assets, decentralized finance protocols, and blockchain-based financial services.

Centralized exchanges currently control the majority of global trading volume due to their liquidity depth, speed of execution, and established user bases. However, these platforms operate under custodial models where users must deposit their assets into exchange-controlled wallets.

In response to these challenges, decentralized exchanges (DEXs) have emerged as an alternative trading infrastructure. While DEX adoption has grown significantly in recent years, many existing decentralized platforms still face limitations related to scalability, user experience, liquidity fragmentation, and accessibility for users in emerging markets.

Zyra enters this competitive landscape with a strategic focus on addressing several of the structural gaps that remain within the existing exchange ecosystem.

**Non-Custodial Infrastructure** — Zyra operates entirely through decentralized smart contracts that allow users to trade directly from their wallets without transferring custody of their assets to the exchange.

**AI-Enhanced Trading Infrastructure** — The platform integrates artificial intelligence tools designed to improve trading efficiency and user experience, including market analytics, liquidity optimization, fraud detection, and portfolio insights.

**Emerging Market Optimization** — Zyra is designed to support the realities of users in emerging markets, particularly across Africa. The platform prioritizes mobile accessibility, lightweight architecture for lower bandwidth environments, and community-driven growth strategies.

**Transparent Token Economics** — The Zyra ecosystem is supported by a transparent token economy that aligns the long-term success of the platform with the interests of its community.`,
  },
  {
    title: "8. Founding Team",
    content: `Zyra is developed by a multidisciplinary team of innovators with backgrounds in software engineering, blockchain technology, and cryptocurrency markets. The team shares a unified vision: to build decentralized financial infrastructure that expands access to global digital markets for individuals in emerging economies.

**Fatima Yusuf — Founder & Chief Executive Officer**

Fatima Zahra Yusuf is the Founder and Chief Executive Officer of Zyra and the original architect behind the Zyra protocol. As a software engineer with a strong focus on blockchain systems and decentralized applications, she has dedicated her work to building technologies that improve financial accessibility through decentralized infrastructure.

Her expertise lies in designing scalable digital platforms, understanding blockchain architecture, and developing innovative solutions within the rapidly evolving Web3 ecosystem. As CEO, she leads the overall strategic direction of the platform, including product development, protocol architecture, ecosystem expansion, and long-term vision.

**Usman Zayyana Shehu — Co-Founder**

Usman Zayyana Shehu is the Co-Founder of Zyra and brings a strong background in computer applications and digital technology systems. His academic foundation in computer science provides a solid technical framework that supports the development and evolution of Zyra's exchange infrastructure.

At Zyra, Usman contributes to the platform's technological strategy and infrastructure design, helping ensure that the exchange remains scalable, efficient, and capable of supporting a growing global user base.

**Sadiq Aminu Safana — Crypto Strategy & Ecosystem Development**

Sadiq Aminu Safana brings over five years of experience in the cryptocurrency ecosystem, with a deep understanding of digital asset markets, blockchain communities, and the evolving dynamics of decentralized finance.

At Zyra, Sadiq focuses on ecosystem development, market strategy, and community growth. He works to position Zyra within the broader cryptocurrency market while supporting the development of a vibrant user community.

**A Shared Vision**

The Zyra founding team is united by a common belief that decentralized technology has the potential to transform global financial systems and unlock new economic opportunities for individuals in emerging markets.

**Advisory Board (To Be Announced)**

Zyra will onboard experienced advisors across:
• Blockchain security
• DeFi protocol design
• Regulatory compliance
• AI and data systems

Advisors will be publicly announced prior to the Token Generation Event (TGE), along with verified profiles and credentials.`,
  },
  {
    title: "9. Funds Usage",
    content: `Funds raised from the presale and ICO will be used to accelerate development of the Zyra ecosystem.`,
    table: {
      headers: ["Category", "Allocation"],
      rows: [
        ["Platform Development", "35%"],
        ["Security & Smart Contract Audits", "15%"],
        ["Marketing & Community Growth", "25%"],
        ["Liquidity Provision", "15%"],
        ["Operations & Legal", "10%"],
      ],
    },
  },
  {
    title: "10. Roadmap",
    table: {
      headers: ["Phase", "Timeline", "Milestone"],
      rows: [
        ["Phase 0", "2025 (Completed)", "ZRA Token Development & Smart Contract Initialization"],
        ["Phase 1", "June 2026", "First Presale Launch"],
        ["Phase 2", "Q3 2026", "MVP (Minimum Viable Product) Release"],
        ["Phase 3", "Q4 2026", "Public ICO & Token Distribution Event"],
        ["Phase 4", "Q4 2026", "Testnet Launch"],
        ["Phase 5", "Q1 2027", "Mainnet Exchange Launch"],
        ["Phase 6", "Q1–Q2 2027", "Mobile Applications (iOS & Android)"],
        ["Phase 7", "Q2 2027", "DAO Governance Activation"],
        ["Phase 8", "Q3–Q4 2027", "Cross-Chain Integration & Liquidity Expansion"],
        ["Phase 9", "2028", "Advanced AI Trading & Automation Systems"],
      ],
    },
  },
  {
    title: "Legal Disclaimer",
    content: `This whitepaper is for informational purposes only and does not constitute financial, investment, legal, or tax advice. The information contained herein is subject to change without notice.

Participation in the Zyra ecosystem involves significant risk, including the potential loss of capital. Prospective participants should conduct their own independent research and consult with qualified professionals before making any decisions.

This document does not constitute an offer or solicitation to sell shares or securities in Zyra or any related or associated company. Any such offer or solicitation will be made only by means of a formal offering document and in accordance with applicable laws and regulations.`,
  },
];

type TableData = { headers: string[]; rows: string[][] };
type Feature = { name: string; desc: string };
type Subsection = {
  subtitle: string;
  content: string;
  bullets?: string[];
  afterBullets?: string;
};

type Section = {
  title: string;
  content?: string;
  subsections?: Subsection[];
  features?: Feature[];
  table?: TableData;
  tokenTable?: TableData;
  pricingTable?: TableData;
  afterTable?: string;
  afterPricing?: string;
  bullets?: string[];
  afterBullets?: string;
};

const RenderMarkdownText = ({ text }: { text: string }) => {
  return (
    <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
      {text.split("**").map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="text-foreground">{part}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </div>
  );
};

const RenderTable = ({ data }: { data: TableData }) => (
  <div className="overflow-x-auto my-6">
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          {data.headers.map((h) => (
            <th key={h} className="text-left p-3 bg-secondary text-foreground font-semibold border border-border">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} className="p-3 border border-border text-muted-foreground">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const RenderSection = ({ section }: { section: Section }) => (
  <div>
    <h2 className="text-2xl font-bold mb-4 text-primary">{section.title}</h2>

    {section.content && <RenderMarkdownText text={section.content} />}

    {section.subsections?.map((sub) => (
      <div key={sub.subtitle} className="mt-6">
        <h3 className="text-xl font-semibold mb-2 text-foreground">{sub.subtitle}</h3>
        <RenderMarkdownText text={sub.content} />
        {sub.bullets && (
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            {sub.bullets.map((b) => <li key={b}>{b}</li>)}
          </ul>
        )}
        {sub.afterBullets && (
          <p className="text-muted-foreground mt-3">{sub.afterBullets}</p>
        )}
      </div>
    ))}

    {section.features && (
      <div className="mt-6 space-y-4">
        {section.features.map((f) => (
          <div key={f.name}>
            <h4 className="font-semibold text-foreground uppercase tracking-wide text-sm">{f.name}</h4>
            <p className="text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    )}

    {section.bullets && (
      <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-1">
        {section.bullets.map((b) => <li key={b}>{b}</li>)}
      </ul>
    )}
    {section.afterBullets && (
      <p className="text-muted-foreground mt-3">{section.afterBullets}</p>
    )}

    {section.table && <RenderTable data={section.table} />}
    {section.tokenTable && (
      <>
        <h3 className="text-xl font-semibold mt-8 mb-2 text-foreground">Token Allocation</h3>
        <RenderTable data={section.tokenTable} />
      </>
    )}
    {section.afterTable && <RenderMarkdownText text={section.afterTable} />}
    {section.pricingTable && (
      <>
        <h3 className="text-xl font-semibold mt-8 mb-2 text-foreground">ZRA Token Pricing Structure</h3>
        <RenderTable data={section.pricingTable} />
      </>
    )}
    {section.afterPricing && <RenderMarkdownText text={section.afterPricing} />}
  </div>
);

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
            {(sections as Section[]).map((section) => (
              <RenderSection key={section.title} section={section} />
            ))}
          </div>

          <div className="mt-16 text-center border-t border-border pt-8">
            <p className="text-2xl font-bold text-primary">ZYRA</p>
            <p className="text-muted-foreground">Decentralized Exchange for Africa</p>
            <p className="text-muted-foreground mt-1">zyra.finance</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Whitepaper;
