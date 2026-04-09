import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeftRight,
  BarChart3,
  Droplets,
  Coins,
  Vote,
  Home,
  Menu,
  X,
} from "lucide-react";
import WalletButton from "./WalletButton";
import zyraLogo from "@/assets/zyra-logo.png";

const navItems = [
  { label: "Swap", href: "/dex", icon: ArrowLeftRight },
  { label: "Trade", href: "/dex/trade", icon: BarChart3 },
  { label: "Liquidity", href: "/dex/liquidity", icon: Droplets },
  { label: "Staking", href: "/dex/staking", icon: Coins },
  { label: "Governance", href: "/dex/governance", icon: Vote },
];

const DexLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 glass-strong h-14 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 group mr-2">
            <img src={zyraLogo} alt="Zyra" className="w-7 h-7 rounded-lg" />
            <span className="text-base font-display font-bold tracking-tight">Zyra</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold uppercase tracking-widest">DEX</span>
          </Link>
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => {
              const active = location.pathname === item.href;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/" className="hidden md:flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-secondary/50">
            <Home className="w-3 h-3" />
            Home
          </Link>
          <WalletButton />
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary/50"
            onClick={() => setMobileNav(!mobileNav)}
          >
            {mobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile nav */}
      {mobileNav && (
        <div className="fixed inset-0 z-30 pt-14 bg-background/95 backdrop-blur-xl md:hidden">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const active = location.pathname === item.href;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileNav(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                    active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              to="/"
              onClick={() => setMobileNav(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="pt-14 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default DexLayout;
