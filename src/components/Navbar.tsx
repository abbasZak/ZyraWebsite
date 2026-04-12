import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import zyraLogo from "@/assets/zyra-logo.png";
import PresaleCountdown from "@/components/PresaleCountdown";

const navLinks = [
  { label: "Features", path: "/#features" },
  { label: "Tokenomics", path: "/#tokenomics" },
  { label: "Roadmap", path: "/#roadmap" },
  { label: "Team", path: "/#team" },
  { label: "Whitepaper", path: "/whitepaper" },
  { label: "Launch DEX", path: "/dex" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Handle hash scrolling after navigation
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);

  const handleNavigation = (path: string) => {
    if (path.startsWith("/#")) {
      const hash = path.substring(2);
      
      if (location.pathname === "/") {
        // Already on home page, just scroll to section
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // Navigate to home page with hash
        navigate(path);
      }
    } else {
      // Handle regular routes
      navigate(path);
    }
    setMobileOpen(false);
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  const handleCountdownClick = () => {
    if (location.pathname === "/") {
      const element = document.getElementById("tokenomics");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/#tokenomics");
    }
    setMobileOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled
          ? "glass-strong shadow-lg shadow-background/50"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <img
            src={zyraLogo}
            alt="Zyra"
            className="w-8 h-8 rounded-lg transition-transform duration-300 group-hover:scale-110"
          />
          <span className="text-lg font-display font-bold tracking-tight">Zyra</span>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavigation(link.path)}
              className="px-3.5 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50 cursor-pointer"
            >
              {link.label}
            </button>
          ))}
          <div className="ml-3 pl-3 border-l border-border">
            <button onClick={handleCountdownClick} className="cursor-pointer">
              <PresaleCountdown compact />
            </button>
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
                <button
                  key={link.label}
                  onClick={() => handleNavigation(link.path)}
                  className="block w-full text-left px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-2 px-3">
                <button onClick={handleCountdownClick} className="w-full cursor-pointer">
                  <PresaleCountdown compact />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;