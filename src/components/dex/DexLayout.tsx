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
  Minus,
  Plus
} from "lucide-react";
import SimpleWalletButton from "./SimpleWalletButton";
import OnboardingTour, { useOnboardingTour } from "./OnboardingTour";
import { useAuth } from "@/components/auth/AuthProvider";
import { useWallet } from "@solana/wallet-adapter-react";
import zyraLogo from "../../images/zyra-logo.jpeg";

const navItems = [
  { label: "Swap", href: "/dex", icon: ArrowLeftRight, tourId: "swap" },
  { label: "Trade", href: "/dex/trade", icon: BarChart3, tourId: "trade" },
  { label: "Add Liquidity", href: "/dex/liquidity", icon: Plus, tourId: "add-liquidity" },
  { label: "Remove", href: "/dex/remove-liquidity", icon: Minus, tourId: "remove" },
  { label: "Staking", href: "/dex/staking", icon: Coins, tourId: "staking" },
  { label: "Governance", href: "/dex/governance", icon: Vote, tourId: "governance" },
  { label: "AI", href: "/dex/ai", icon: Brain, tourId: "ai" },
];

const DexLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { connected } = useWallet(); // Add this to monitor wallet connection
  const { showTour, startTour, completeTour, shouldShowTour } = useOnboardingTour();
  const [hasTriggeredTour, setHasTriggeredTour] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
          
          {/* Desktop Navigation */}
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
          {/* Help/Tour Button */}
          <button
            onClick={startTour}
            className="hidden md:flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-secondary/50"
            title="Take a tour"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
          
          {/* Home Link */}
          <Link 
            to="/" 
            className="hidden md:flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-secondary/50"
          >
            <Home className="w-3 h-3" />
            Home
          </Link>
          
          {/* Wallet Button - Wrapped with data-tour attribute */}
          <div data-tour="wallet">
            <SimpleWalletButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <nav className="fixed top-14 right-0 bottom-0 w-64 bg-background border-l border-border shadow-xl p-4 overflow-y-auto">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const active = location.pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    data-tour={item.tourId}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      active
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <Link
                to="/"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Link>
              <button
                onClick={() => {
                  startTour();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors w-full text-left"
              >
                <HelpCircle className="w-5 h-5" />
                <span>Take Tour</span>
              </button>
            </div>
            
            {/* Wallet Connection Status in Mobile Menu */}
            {connected && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="px-3 py-2">
                  <p className="text-xs text-muted-foreground">Wallet Status</p>
                  <p className="text-sm font-medium text-green-500">Connected</p>
                </div>
              </div>
            )}
          </nav>
        </div>
      )}

      {/* Mobile bottom navigation */}
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