import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeftRight,
  BarChart3,
  Droplets,
  Coins,
  Vote,
  Brain,
  Home,
  Menu,
  X,
  HelpCircle,
} from "lucide-react";
import WalletButton from "./WalletButton";
import OnboardingTour, { useOnboardingTour } from "./OnboardingTour";
import { useAuth } from "@/components/auth/AuthProvider";
import zyraLogo from "@/assets/zyra-logo.png";

const navItems = [
  { label: "Swap", href: "/dex", icon: ArrowLeftRight, tourId: "swap" },
  { label: "Trade", href: "/dex/trade", icon: BarChart3, tourId: "trade" },
  { label: "Liquidity", href: "/dex/liquidity", icon: Droplets, tourId: "liquidity" },
  { label: "Staking", href: "/dex/staking", icon: Coins, tourId: "staking" },
  { label: "Governance", href: "/dex/governance", icon: Vote, tourId: "governance" },
  { label: "AI", href: "/dex/ai", icon: Brain, tourId: "ai" },
];

const DexLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { showTour, startTour, completeTour, shouldShowTour } = useOnboardingTour();
  const [hasTriggeredTour, setHasTriggeredTour] = useState(false);

  // Auto-trigger tour for new users
  useEffect(() => {
    if (user && shouldShowTour() && !hasTriggeredTour) {
      // Small delay to let the page render
      const timer = setTimeout(() => {
        startTour();
        setHasTriggeredTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, shouldShowTour, hasTriggeredTour, startTour]);

  // Escape key to close tour
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showTour) completeTour();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showTour, completeTour]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 glass-strong h-14 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 group mr-2">
            <img src={zyraLogo} alt="Zyra" className="w-7 h-7 rounded-lg" />
            <span className="text-base font-display font-bold tracking-tight hidden sm:inline">Zyra</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold uppercase tracking-widest hidden sm:inline">DEX</span>
          </Link>
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => {
              const active = location.pathname === item.href;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  data-tour={item.tourId}
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
          <button
            onClick={startTour}
            className="hidden md:flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-secondary/50"
            title="Take a tour"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
          <Link to="/" className="hidden md:flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-secondary/50">
            <Home className="w-3 h-3" />
            Home
          </Link>
          <div data-tour="wallet">
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Mobile bottom navigation — always visible */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-border/30 md:hidden">
        <div className="flex items-center justify-around h-14 px-1">
          {navItems.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.label}
                to={item.href}
                data-tour={item.tourId}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-0 ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <item.icon className={`w-5 h-5 ${active ? "text-primary" : ""}`} />
                <span className="text-[10px] font-medium truncate">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={startTour}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-muted-foreground"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="text-[10px] font-medium">Tour</span>
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="pt-14 pb-16 md:pb-0 min-h-screen">
        {children}
      </main>

      {/* Onboarding Tour */}
      <OnboardingTour active={showTour} onComplete={completeTour} />
    </div>
  );
};

export default DexLayout;
