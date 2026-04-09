import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TourStep {
  target: string; // CSS selector
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
}

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="swap"]',
    title: "⚡ Swap Tokens",
    description: "Instantly swap between Solana tokens with the best rates powered by Jupiter Aggregator. Low fees, zero slippage surprises.",
    position: "bottom",
  },
  {
    target: '[data-tour="trade"]',
    title: "📈 Advanced Trading",
    description: "Professional trading terminal with live price charts, order books, and both market & limit orders.",
    position: "bottom",
  },
  {
    target: '[data-tour="liquidity"]',
    title: "💧 Liquidity Pools",
    description: "Provide liquidity to earn trading fees. Add tokens to pools and watch your rewards grow.",
    position: "bottom",
  },
  {
    target: '[data-tour="staking"]',
    title: "🔒 Stake & Earn",
    description: "Lock your ZRA tokens for up to 40% APR. Choose from flexible tiers — the longer you stake, the more you earn.",
    position: "bottom",
  },
  {
    target: '[data-tour="governance"]',
    title: "🗳️ Governance",
    description: "Shape the future of Zyra! Create proposals, vote on changes, and help govern the platform with your ZRA tokens.",
    position: "bottom",
  },
  {
    target: '[data-tour="ai"]',
    title: "🧠 AI Hub",
    description: "Your AI-powered trading assistant. Get market analysis, trade signals, and portfolio recommendations.",
    position: "bottom",
  },
  {
    target: '[data-tour="wallet"]',
    title: "👛 Connect Wallet",
    description: "Connect your Phantom or Solflare wallet to start trading. Your gateway to the Solana ecosystem!",
    position: "bottom",
  },
];

const TOUR_STORAGE_KEY = "zyra_tour_completed";

export const useOnboardingTour = () => {
  const [showTour, setShowTour] = useState(false);

  const startTour = useCallback(() => setShowTour(true), []);
  const completeTour = useCallback(() => {
    setShowTour(false);
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
  }, []);

  const shouldShowTour = useCallback(() => {
    return !localStorage.getItem(TOUR_STORAGE_KEY);
  }, []);

  return { showTour, startTour, completeTour, shouldShowTour };
};

interface OnboardingTourProps {
  active: boolean;
  onComplete: () => void;
}

const OnboardingTour = ({ active, onComplete }: OnboardingTourProps) => {
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = tourSteps[step];

  useEffect(() => {
    if (!active) return;

    const updatePosition = () => {
      const el = document.querySelector(currentStep.target);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          setTargetRect(el.getBoundingClientRect());
        }, 300);
      } else {
        setTargetRect(null);
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [active, step, currentStep.target]);

  const next = () => {
    if (step < tourSteps.length - 1) setStep(step + 1);
    else onComplete();
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  if (!active) return null;

  const tooltipStyle = (): React.CSSProperties => {
    if (!targetRect) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

    const pos = currentStep.position || "bottom";
    const gap = 12;

    switch (pos) {
      case "bottom":
        return {
          top: targetRect.bottom + gap,
          left: Math.max(16, Math.min(targetRect.left + targetRect.width / 2 - 160, window.innerWidth - 336)),
        };
      case "top":
        return {
          bottom: window.innerHeight - targetRect.top + gap,
          left: Math.max(16, Math.min(targetRect.left + targetRect.width / 2 - 160, window.innerWidth - 336)),
        };
      case "right":
        return {
          top: targetRect.top + targetRect.height / 2 - 60,
          left: targetRect.right + gap,
        };
      case "left":
        return {
          top: targetRect.top + targetRect.height / 2 - 60,
          right: window.innerWidth - targetRect.left + gap,
        };
      default:
        return {};
    }
  };

  return createPortal(
    <AnimatePresence>
      {active && (
        <>
          {/* Overlay with spotlight cutout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
            style={{ pointerEvents: "auto" }}
          >
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <mask id="tour-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  {targetRect && (
                    <rect
                      x={targetRect.left - 6}
                      y={targetRect.top - 6}
                      width={targetRect.width + 12}
                      height={targetRect.height + 12}
                      rx="12"
                      fill="black"
                    />
                  )}
                </mask>
              </defs>
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="rgba(0,0,0,0.7)"
                mask="url(#tour-mask)"
              />
            </svg>

            {/* Spotlight ring */}
            {targetRect && (
              <motion.div
                layoutId="spotlight"
                className="absolute border-2 border-primary rounded-xl pointer-events-none"
                style={{
                  left: targetRect.left - 6,
                  top: targetRect.top - 6,
                  width: targetRect.width + 12,
                  height: targetRect.height + 12,
                  boxShadow: "0 0 0 4px hsl(var(--primary) / 0.2), 0 0 20px hsl(var(--primary) / 0.3)",
                }}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            )}

            {/* Tooltip */}
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="absolute z-[101] w-80 glass-strong rounded-2xl p-5 shadow-2xl border border-primary/20"
              style={tooltipStyle()}
            >
              <button
                onClick={onComplete}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-display font-bold text-base mb-2">{currentStep.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{currentStep.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {tourSteps.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i === step ? "bg-primary" : i < step ? "bg-primary/40" : "bg-secondary"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  {step > 0 && (
                    <Button size="sm" variant="outline" onClick={prev} className="h-8 text-xs border-primary/20">
                      <ChevronLeft className="w-3 h-3 mr-1" /> Back
                    </Button>
                  )}
                  <Button size="sm" onClick={next} className="h-8 text-xs glow-sm">
                    {step < tourSteps.length - 1 ? (
                      <>Next <ChevronRight className="w-3 h-3 ml-1" /></>
                    ) : (
                      <>Let's Go! <Sparkles className="w-3 h-3 ml-1" /></>
                    )}
                  </Button>
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground/60 mt-3 text-center">
                {step + 1} of {tourSteps.length} · Press Esc to skip
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default OnboardingTour;
