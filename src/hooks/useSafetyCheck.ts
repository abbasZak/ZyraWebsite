import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { checkTokenSafety, SafetyResult, TokenToCheck } from '@/services/safetyCheck';

interface UseSafetyCheckProps {
  onSafetyConfirmed?: () => void;
}

export function useSafetyCheck({ onSafetyConfirmed }: UseSafetyCheckProps = {}) {
  const [isChecking, setIsChecking] = useState(false);
  const [lastResult, setLastResult] = useState<SafetyResult | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const { toast } = useToast();

  // Main safety check function
  const checkSafety = useCallback(async (token: TokenToCheck, userId: string | undefined) => {
    if (!userId) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to use Safety Check",
        variant: "destructive",
      });
      return null;
    }
    
    setIsChecking(true);
    
    try {
      // Run the safety check
      const result = await checkTokenSafety(token);
      setLastResult(result);
      
      // Show warning if unsafe
      if (!result.isSafe) {
        setShowWarning(true);
        toast({
          title: `⚠️ Safety Alert for ${token.symbol}`,
          description: `${result.warnings.length} risk factors detected. Click for details.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: `✅ ${token.symbol} is Safe`,
          description: `Risk score: ${result.riskScore}/100. No major issues detected.`,
        });
        if (onSafetyConfirmed) onSafetyConfirmed();
      }
      
      return result;
      
    } catch (error) {
      console.error("Safety check failed:", error);
      toast({
        title: "Safety Check Failed",
        description: "Unable to verify token safety. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsChecking(false);
    }
  }, [onSafetyConfirmed, toast]);

  const confirmSafety = useCallback(() => {
    setShowWarning(false);
    if (onSafetyConfirmed) onSafetyConfirmed();
  }, [onSafetyConfirmed]);

  const cancelTrade = useCallback(() => {
    setShowWarning(false);
    setLastResult(null);
  }, []);

  return {
    checkSafety,
    isChecking,
    lastResult,
    showWarning,
    confirmSafety,
    cancelTrade,
  };
}