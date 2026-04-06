import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import zyraLogo from "@/assets/zyra-logo.png";
import PresaleCountdown from "@/components/PresaleCountdown";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Tokenomics", href: "#tokenomics" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Team", href: "#team" },
  { label: "Whitepaper", href: "/whitepaper" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled
          ? "glass-strong shadow-lg shadow-background/50"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5 group">
          <img
            src={zyraLogo}
            alt="Zyra"
            className="w-8 h-8 rounded-lg transition-transform duration-300 group-hover:scale-110"
          />
          <span className="text-lg font-display font-bold tracking-tight">Zyra</span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-3.5 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
            >
              {link.label}
            </a>
          ))}
          <div className="ml-3 pl-3 border-l border-border">
            <a href="#tokenomics">
              <PresaleCountdown compact />
            </a>
          </div>
        </div>

        <button
          className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-secondary/50 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong overflow-hidden"
          >
            <div className="px-6 py-4 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2 px-3">
                <a href="#tokenomics" onClick={() => setMobileOpen(false)}>
                  <PresaleCountdown compact />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
