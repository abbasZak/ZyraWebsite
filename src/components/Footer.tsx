import zyraLogo from "@/assets/zyra-logo.png";

const Footer = () => {
  return (
    <footer className="relative pt-20 pb-8 border-t border-border/50">
      <div className="container mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="/" className="flex items-center gap-2.5 mb-4">
              <img src={zyraLogo} alt="Zyra" className="w-8 h-8 rounded-lg" />
              <span className="text-lg font-display font-bold tracking-tight">Zyra</span>
            </a>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Decentralized exchange infrastructure built for Africa and the world.
            </p>
          </div>

          {/* Protocol */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Protocol</h4>
            <ul className="space-y-2.5">
              {["Features", "Tokenomics", "Roadmap"].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Resources</h4>
            <ul className="space-y-2.5">
              <li><a href="/whitepaper" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Whitepaper</a></li>
              <li><a href="#team" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Team</a></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Community</h4>
            <ul className="space-y-2.5">
              <li><span className="text-sm text-muted-foreground">Twitter — Coming soon</span></li>
              <li><span className="text-sm text-muted-foreground">Telegram — Coming soon</span></li>
              <li><span className="text-sm text-muted-foreground">Discord — Coming soon</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Zyra. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              zyra.finance
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground/60 text-center mt-6 max-w-2xl mx-auto leading-relaxed">
            This website is for informational purposes only and does not constitute financial, investment, legal, or tax advice. Participation involves significant risk, including the potential loss of capital.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
