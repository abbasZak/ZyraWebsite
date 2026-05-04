import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Loader2, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSafetyCheck } from '@/hooks/useSafetyCheck';
import { SafetyResult } from '@/services/safetyCheck';

interface SafetyCheckProps {
  tokenMint: string;
  tokenSymbol: string;
  tokenName: string;
  onSafetyConfirmed: () => void;
  userId: string | undefined;
}

export function SafetyCheck({ tokenMint, tokenSymbol, tokenName, onSafetyConfirmed, userId }: SafetyCheckProps) {
  const [showModal, setShowModal] = useState(false);
  const [hasPurchasedCredits, setHasPurchasedCredits] = useState(false);
  const [demoCredits, setDemoCredits] = useState<number | null>(() => {
    // Load credits from localStorage for demo
    const saved = localStorage.getItem('demo_safety_credits');
    return saved ? parseInt(saved) : 5; // Start with 5 free credits
  });
  
  const {
    checkSafety,
    isChecking,
    lastResult,
    showWarning,
    confirmSafety,
    cancelTrade,
  } = useSafetyCheck({ onSafetyConfirmed });

  // Save credits to localStorage whenever they change
  useEffect(() => {
    if (demoCredits !== null) {
      localStorage.setItem('demo_safety_credits', demoCredits.toString());
    }
  }, [demoCredits]);

  const handleCheckSafety = async () => {
    // Check if user has credits
    if (demoCredits !== null && demoCredits <= 0 && !hasPurchasedCredits) {
      alert("You don't have enough credits! Click 'Purchase Credits' to continue.");
      return;
    }
    
    const result = await checkSafety(
      { mint: tokenMint, symbol: tokenSymbol, name: tokenName },
      userId
    );
    
    // Deduct 1 credit if check was performed
    if (result && demoCredits !== null && demoCredits > 0) {
      setDemoCredits(demoCredits - 1);
    }
    
    if (result && !result.isSafe) {
      setShowModal(true);
    }
  };

  // Simplified credit purchase for demo
  const purchaseCredits = () => {
    // For hackathon demo, just add 10 free credits
    setDemoCredits((prev) => (prev || 0) + 10);
    setHasPurchasedCredits(true);
    alert("✨ 10 free credits added for demo! In production, this would process payment.");
  };

  const RiskMeter = ({ score }: { score: number }) => {
    const getColor = () => {
      if (score < 30) return 'bg-green-500';
      if (score < 60) return 'bg-yellow-500';
      return 'bg-red-500';
    };
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Risk Score</span>
          <span className={score >= 60 ? 'text-red-500 font-bold' : score >= 30 ? 'text-yellow-500' : 'text-green-500'}>
            {score}/100
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className={`h-full ${getColor()} transition-all duration-500`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    );
  };

  const WarningModal = ({ result }: { result: SafetyResult }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-card rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto border border-red-500/30 shadow-xl">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="font-bold">Safety Alert!</h3>
          </div>
          <button onClick={() => setShowModal(false)} className="p-1 hover:bg-secondary rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            Our AI has detected potential risks with <span className="text-foreground font-bold">{tokenSymbol}</span>
          </p>
          
          <RiskMeter score={result.riskScore} />
          
          {result.warnings.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-red-400">⚠️ Warnings:</p>
              <ul className="space-y-1.5">
                {result.warnings.map((warning, i) => (
                  <li key={i} className="text-sm text-red-300/80 flex items-start gap-2">
                    <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {result.recommendations.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
              <p className="text-sm font-semibold text-yellow-400 mb-2">💡 Recommendations:</p>
              <ul className="space-y-1">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="text-xs text-yellow-300/80">• {rec}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={confirmSafety} className="flex-1 bg-red-600 hover:bg-red-700">
              I Understand the Risk
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Show credits info
  const CreditInfo = () => (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Zap className="w-3 h-3 text-primary" />
      <span>{demoCredits !== null ? `${demoCredits} credits left` : 'Loading...'}</span>
    </div>
  );

  return (
    <>
      {showModal && lastResult && <WarningModal result={lastResult} />}
      
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCheckSafety}
            disabled={isChecking || (demoCredits !== null && demoCredits <= 0 && !hasPurchasedCredits)}
            className="gap-2 border-primary/30 hover:border-primary/60"
          >
            {isChecking ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Shield className="w-3 h-3" />
            )}
            {isChecking ? 'Analyzing...' : 'AI Safety Check'}
          </Button>
          
          <CreditInfo />
        </div>
        
        {(demoCredits !== null && demoCredits <= 0 && !hasPurchasedCredits) && (
          <Button
            variant="link"
            size="sm"
            onClick={purchaseCredits}
            className="text-primary text-xs"
          >
            Purchase Credits →
          </Button>
        )}
      </div>
      
      {showWarning && !showModal && (
        <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-xs text-red-400">High risk detected!</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={cancelTrade} className="text-xs h-7">
              Cancel
            </Button>
            <Button size="sm" onClick={confirmSafety} className="text-xs h-7 bg-red-600">
              Continue Anyway
            </Button>
          </div>
        </div>
      )}
    </>
  );
}