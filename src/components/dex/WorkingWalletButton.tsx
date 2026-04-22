import { useState, useEffect } from "react";
import { Wallet, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const WorkingWalletButton = () => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if already connected on mount
    const checkConnection = async () => {
      try {
        const solana = (window as any)?.solana;
        if (solana?.isPhantom && solana?.publicKey) {
          setPublicKey(solana.publicKey.toString());
        }
        
        // Listen for account changes
        if (solana) {
          solana.on('accountChanged', (newPublicKey: any) => {
            if (newPublicKey) {
              setPublicKey(newPublicKey.toString());
            } else {
              setPublicKey(null);
            }
          });
        }
      } catch (err) {
        console.error("Connection check error:", err);
      }
    };
    
    checkConnection();
  }, []);

  const connectWallet = async () => {
    setConnecting(true);
    setError(null);
    
    try {
      const solana = (window as any)?.solana;
      
      if (!solana) {
        throw new Error("Phantom wallet not installed");
      }
      
      if (!solana.isPhantom) {
        throw new Error("Phantom wallet not detected");
      }
      
      // Try multiple connection methods
      let response = null;
      
      // Method 1: Standard connect
      try {
        console.log("Trying standard connect...");
        response = await solana.connect();
      } catch (err: any) {
        console.log("Standard connect failed:", err.message);
        
        // Method 2: Request connection via request method
        try {
          console.log("Trying request method...");
          response = await solana.request({
            method: "connect",
            params: { onlyIfTrusted: false }
          });
        } catch (err2: any) {
          console.log("Request method failed:", err2.message);
          
          // Method 3: Use the legacy connect method
          try {
            console.log("Trying legacy connect...");
            response = await (solana as any).connect({ onlyIfTrusted: false });
          } catch (err3: any) {
            throw new Error("All connection methods failed. Please refresh the page and try again.");
          }
        }
      }
      
      if (response && response.publicKey) {
        const pubKey = typeof response.publicKey === 'string' 
          ? response.publicKey 
          : response.publicKey.toString();
        
        setPublicKey(pubKey);
        console.log("Connected successfully:", pubKey);
        toast({
          title: "Connected!",
          description: `Wallet connected: ${pubKey.slice(0, 4)}...${pubKey.slice(-4)}`,
        });
      } else {
        throw new Error("Connection response missing public key");
      }
      
    } catch (err: any) {
      console.error("Connection error:", err);
      
      let errorMessage = "Failed to connect wallet";
      if (err.message?.includes("not installed")) {
        errorMessage = "Phantom wallet not installed. Please install Phantom extension.";
        window.open("https://phantom.app/", "_blank");
      } else if (err.code === 4001 || err.message?.includes("reject")) {
        errorMessage = "Connection rejected. Please approve the connection request.";
      } else if (err.message?.includes("timeout")) {
        errorMessage = "Connection timeout. Please refresh and try again.";
      } else {
        errorMessage = "Connection failed. Please make sure Phantom is unlocked and try again.";
      }
      
      setError(errorMessage);
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      const solana = (window as any)?.solana;
      if (solana) {
        await solana.disconnect();
        setPublicKey(null);
        setError(null);
        toast({
          title: "Disconnected",
          description: "Wallet has been disconnected",
        });
      }
    } catch (err) {
      console.error("Disconnect error:", err);
    }
  };

  const displayAddress = publicKey 
    ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
    : "";

  if (connecting) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Connecting...
      </Button>
    );
  }

  if (publicKey) {
    return (
      <div className="flex gap-2 items-center">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 border-green-500/50"
        >
          <CheckCircle className="w-3 h-3 text-green-500" />
          {displayAddress}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={disconnectWallet}
          className="text-red-500 hover:text-red-600 text-xs"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Button 
        size="sm" 
        className="gap-2 bg-green-600 hover:bg-green-700 text-white" 
        onClick={connectWallet}
      >
        <Wallet className="w-4 h-4" />
        Connect Phantom
      </Button>
      {error && (
        <div className="text-xs text-red-500 flex items-center gap-1 max-w-[200px]">
          <XCircle className="w-3 h-3 shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}
    </div>
  );
};

export default WorkingWalletButton;