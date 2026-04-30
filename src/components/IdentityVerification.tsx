import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface IdentityVerificationProps {
  onVerified: () => void;
  walletAddress: string | null;
}

const IdentityVerification = ({ onVerified, walletAddress }: IdentityVerificationProps) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'rejected'>('pending');
  const { toast } = useToast();

  const verifyWallet = async () => {
    if (!walletAddress) {
      toast({ title: "Connect Wallet First", variant: "destructive" });
      return;
    }

    setIsVerifying(true);
    
    try {
      // Simple verification: check wallet age via Solana Beach API
      const response = await fetch(`https://api.solanabeach.io/v1/account/${walletAddress}`);
      const data = await response.json();
      
      const accountAge = data.account?.createdAt ? 
        (Date.now() - new Date(data.account.createdAt).getTime()) / (1000 * 60 * 60 * 24) : 0;
      
      if (accountAge > 7) {
        setVerificationStatus('verified');
        toast({ title: "Identity Verified!", description: "You can now access the DEX" });
        onVerified();
      } else {
        setVerificationStatus('rejected');
        toast({ title: "Verification Failed", description: "Wallet too new. Must be 7+ days old", variant: "destructive" });
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast({ title: "Verification Failed", description: "Please try again", variant: "destructive" });
    } finally {
      setIsVerifying(false);
    }
  };

  if (verificationStatus === 'verified') {
    return (
      <div className="bg-green-500/10 rounded-xl p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold mb-2">Identity Verified ✓</h3>
        <p className="text-sm text-muted-foreground">You have full access to the DEX</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 border border-border text-center">
      <h2 className="text-xl font-bold mb-4">Verify Your Identity</h2>
      <p className="text-sm text-muted-foreground mb-6">
        To access the DEX, you need to verify your wallet identity.
        This ensures a secure trading environment.
      </p>
      
      <Button 
        onClick={verifyWallet} 
        disabled={isVerifying || !walletAddress}
        className="w-full"
      >
        {isVerifying ? (
          <><Loader2 className="w-4 h-4 animate-spin mr-2" />Verifying...</>
        ) : (
          "Verify Wallet Identity"
        )}
      </Button>
      
      {verificationStatus === 'rejected' && (
        <div className="mt-4 text-red-500 text-sm flex items-center justify-center gap-2">
          <XCircle className="w-4 h-4" />
          Wallet verification failed
        </div>
      )}
    </div>
  );
};

export default IdentityVerification;