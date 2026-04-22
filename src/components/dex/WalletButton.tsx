import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useCallback, useMemo, useState, useEffect } from "react";
import { Wallet, ChevronDown, Copy, LogOut, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const WalletButton = () => {
  const { publicKey, wallet, disconnect, connected, connecting, select, wallets, connect } = useWallet();
  const { setVisible } = useWalletModal();
  const { toast } = useToast();
  const [isConnectingDirect, setIsConnectingDirect] = useState(false);

  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);
  const displayAddress = useMemo(() => {
    if (!base58) return "";
    return base58.slice(0, 4) + "..." + base58.slice(-4);
  }, [base58]);

  const copyAddress = useCallback(() => {
    if (base58) {
      navigator.clipboard.writeText(base58);
      toast({ 
        title: "Address copied", 
        description: "Wallet address has been copied to clipboard",
      });
    }
  }, [base58, toast]);

  const openExplorer = useCallback(() => {
    if (base58) {
      window.open(`https://solscan.io/account/${base58}`, "_blank");
    }
  }, [base58]);

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
      toast({ 
        title: "Wallet disconnected", 
        description: "Your wallet has been disconnected",
      });
    } catch (error) {
      console.error("Disconnect error:", error);
      toast({ 
        title: "Error", 
        description: "Failed to disconnect wallet",
        variant: "destructive",
      });
    }
  }, [disconnect, toast]);

  // Direct connection to Phantom
  const connectDirectToPhantom = async () => {
    setIsConnectingDirect(true);
    try {
      // @ts-ignore
      const solana = window?.solana;
      
      if (!solana || !solana.isPhantom) {
        toast({ 
          title: "Phantom not found", 
          description: "Please install Phantom wallet extension",
          variant: "destructive",
        });
        window.open("https://phantom.app/", "_blank");
        setIsConnectingDirect(false);
        return;
      }

      // Request connection
      const response = await solana.connect();
      
      if (response.publicKey) {
        toast({ 
          title: "Connected!", 
          description: "Successfully connected to Phantom wallet",
        });
        // Reload to sync wallet state
        setTimeout(() => window.location.reload(), 500);
      }
    } catch (error: any) {
      console.error("Direct connection error:", error);
      
      // Handle user rejection
      if (error.code === 4001) {
        toast({ 
          title: "Connection rejected", 
          description: "Please approve the connection request",
          variant: "destructive",
        });
      } else {
        toast({ 
          title: "Connection failed", 
          description: "Please make sure Phantom is unlocked and try again",
          variant: "destructive",
        });
      }
    } finally {
      setIsConnectingDirect(false);
    }
  };

  const handleConnect = async () => {
    console.log("Attempting to connect...");
    
    // First, try to select Phantom wallet
    const phantomWallet = wallets.find(w => w.adapter.name === 'Phantom');
    
    if (phantomWallet) {
      try {
        // Select Phantom
        select(phantomWallet.adapter.name);
        
        // Wait a bit for selection
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Try to connect
        await connect();
        console.log("Connected via adapter");
        return;
      } catch (error) {
        console.log("Adapter connection failed, trying direct method...", error);
      }
    }
    
    // Fallback to direct connection
    await connectDirectToPhantom();
  };

  // Check if already connected via window.solana
  useEffect(() => {
    const checkConnection = async () => {
      // @ts-ignore
      const solana = window?.solana;
      if (solana?.isPhantom && !connected && !connecting) {
        try {
          const response = await solana.connect({ onlyIfTrusted: true });
          if (response.publicKey) {
            console.log("Auto-reconnected to Phantom");
          }
        } catch (error) {
          // Not connected, that's fine
        }
      }
    };
    
    checkConnection();
  }, []);

  if (connecting || isConnectingDirect) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Connecting...
      </Button>
    );
  }

  if (connected && base58) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:border-primary/40 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {wallet?.adapter.icon && (
              <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="w-4 h-4" />
            )}
            {displayAddress}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="gap-2 text-xs cursor-pointer" onClick={copyAddress}>
            <Copy className="w-3 h-3" /> Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 text-xs cursor-pointer" onClick={openExplorer}>
            <ExternalLink className="w-3 h-3" /> View on Solscan
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 text-xs cursor-pointer text-destructive" onClick={handleDisconnect}>
            <LogOut className="w-3 h-3" /> Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      size="sm"
      className="gap-2"
      onClick={handleConnect}
    >
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </Button>
  );
};

export default WalletButton;