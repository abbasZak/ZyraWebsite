import { useState, useEffect } from "react";
import { Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Web3WalletButton = () => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();

  // Helper to get provider
  const getProvider = () => {
    return (window as any).phantom?.solana || (window as any).solana;
  };

  // Check for existing connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const provider = getProvider();
        if (provider?.isPhantom && provider?.publicKey) {
          setPublicKey(provider.publicKey.toString());
        }
      } catch (err) {
        console.error("Check error:", err);
      }
    };
    
    checkConnection();
  }, []);

  const connectWallet = async () => {
    setConnecting(true);
    
    try {
      const provider = getProvider();
      
      if (!provider) {
        toast({
          title: "Phantom Not Found",
          description: "Please install Phantom wallet extension",
          variant: "destructive",
        });
        window.open("https://phantom.app/", "_blank");
        setConnecting(false);
        return;
      }
      
      if (!provider.isPhantom) {
        toast({
          title: "Wrong Wallet",
          description: "Please use Phantom wallet",
          variant: "destructive",
        });
        setConnecting(false);
        return;
      }
      
      console.log("Provider found: Phantom");
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Connection timeout - please approve the request")), 15000)
      );
      
      // Try to connect
      const connectPromise = provider.connect();
      const response = await Promise.race([connectPromise, timeoutPromise]) as any;
      
      if (response && response.publicKey) {
        const pubKey = response.publicKey.toString();
        setPublicKey(pubKey);
        
        // Store in localStorage for persistence
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletPublicKey', pubKey);
        
        toast({
          title: "Connected!",
          description: `Wallet: ${pubKey.slice(0, 4)}...${pubKey.slice(-4)}`,
        });
      }
    } catch (err: any) {
      console.error("Connection error:", err);
      
      if (err.message?.includes("timeout")) {
        toast({
          title: "Connection Timeout",
          description: "Please approve the connection request in Phantom",
          variant: "destructive",
        });
      } else if (err.code === 4001) {
        toast({
          title: "Connection Rejected",
          description: "Please approve the connection request",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Please make sure Phantom is unlocked and try again",
          variant: "destructive",
        });
      }
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      const provider = getProvider();
      if (provider) {
        await provider.disconnect();
      }
      setPublicKey(null);
      localStorage.removeItem('walletConnected');
      localStorage.removeItem('walletPublicKey');
      toast({
        title: "Disconnected",
        description: "Wallet disconnected",
      });
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
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {displayAddress}
        </Button>
        <Button variant="ghost" size="sm" onClick={disconnectWallet}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button 
        size="sm" 
        className="gap-2 bg-purple-600 hover:bg-purple-700 text-white" 
        onClick={connectWallet}
      >
        <Wallet className="w-4 h-4" />
        Connect Phantom
      </Button>
      <p className="text-[10px] text-muted-foreground text-center">
        Make sure Phantom is installed and unlocked
      </p>
    </div>
  );
};

export default Web3WalletButton;