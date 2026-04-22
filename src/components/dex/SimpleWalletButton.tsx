import { useState, useEffect } from "react";
import { Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const SimpleWalletButton = () => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();

  // Check for existing connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const solana = (window as any).solana;
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
        console.error("Check error:", err);
      }
    };
    
    checkConnection();
  }, []);

  const connectWallet = async () => {
    setConnecting(true);
    
    try {
      const solana = (window as any).solana;
      
      if (!solana || !solana.isPhantom) {
        toast({
          title: "Phantom Not Found",
          description: "Please install Phantom wallet extension",
          variant: "destructive",
        });
        window.open("https://phantom.app/", "_blank");
        return;
      }
      
      const response = await solana.connect();
      
      if (response && response.publicKey) {
        const pubKey = response.publicKey.toString();
        setPublicKey(pubKey);
        
        toast({
          title: "Connected!",
          description: `Wallet: ${pubKey.slice(0, 4)}...${pubKey.slice(-4)}`,
        });
      }
    } catch (err: any) {
      console.error("Connection error:", err);
      
      if (err.code === 4001) {
        toast({
          title: "Connection Rejected",
          description: "Please approve the connection request",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Please make sure Phantom is unlocked",
          variant: "destructive",
        });
      }
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      const solana = (window as any).solana;
      if (solana) {
        await solana.disconnect();
      }
      setPublicKey(null);
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
    <Button size="sm" className="gap-2" onClick={connectWallet}>
      <Wallet className="w-4 h-4" />
      Connect Phantom
    </Button>
  );
};

export default SimpleWalletButton;