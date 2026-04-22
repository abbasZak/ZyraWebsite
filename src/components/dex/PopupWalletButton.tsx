import { useState, useEffect } from "react";
import { Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const PopupWalletButton = () => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check localStorage for existing connection
    const savedKey = localStorage.getItem('phantomPublicKey');
    if (savedKey) {
      setPublicKey(savedKey);
    }
    
    // Listen for messages from popup
    window.addEventListener('message', (event) => {
      if (event.data.type === 'PHANTOM_CONNECTED' && event.data.publicKey) {
        setPublicKey(event.data.publicKey);
        localStorage.setItem('phantomPublicKey', event.data.publicKey);
        setConnecting(false);
        toast({
          title: "Connected!",
          description: "Wallet connected successfully",
        });
      }
    });
  }, [toast]);

  const connectWallet = () => {
    setConnecting(true);
    
    // Open popup window with Phantom connection
    const width = 400;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const popup = window.open(
      '/phantom-connect.html',
      'Phantom Connect',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    
    // Fallback timeout
    setTimeout(() => {
      if (connecting) {
        setConnecting(false);
        toast({
          title: "Connection Timeout",
          description: "Please check if Phantom is installed and try again",
          variant: "destructive",
        });
      }
    }, 30000);
  };

  const disconnectWallet = () => {
    setPublicKey(null);
    localStorage.removeItem('phantomPublicKey');
    toast({
      title: "Disconnected",
      description: "Wallet disconnected",
    });
  };

  const displayAddress = publicKey 
    ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
    : "";

  if (connecting) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Waiting for approval...
      </Button>
    );
  }

  if (publicKey) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
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

export default PopupWalletButton;