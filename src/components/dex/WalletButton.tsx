import { useState } from "react";
import { Wallet, ChevronDown, Copy, LogOut, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const wallets = [
  { name: "Phantom", icon: "👻" },
  { name: "Solflare", icon: "🔆" },
  { name: "Backpack", icon: "🎒" },
];

const WalletButton = () => {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const connectWallet = (walletName: string) => {
    // Simulated connection — in production, use @solana/wallet-adapter
    const fakeAddr = "Zyra" + Math.random().toString(36).substring(2, 8) + "..." + Math.random().toString(36).substring(2, 6);
    setAddress(fakeAddr);
    setConnected(true);
    setDialogOpen(false);
  };

  const disconnect = () => {
    setConnected(false);
    setAddress("");
  };

  if (connected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:border-primary/40 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {address}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 glass-strong">
          <DropdownMenuItem className="gap-2 text-xs cursor-pointer">
            <Copy className="w-3 h-3" /> Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 text-xs cursor-pointer">
            <ExternalLink className="w-3 h-3" /> View on Solscan
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 text-xs cursor-pointer text-destructive" onClick={disconnect}>
            <LogOut className="w-3 h-3" /> Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <Button size="sm" className="gap-2 glow-sm" onClick={() => setDialogOpen(true)}>
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass-strong border-border/50 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Connect Wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            {wallets.map((w) => (
              <button
                key={w.name}
                onClick={() => connectWallet(w.name)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary/50 transition-colors text-left"
              >
                <span className="text-xl">{w.icon}</span>
                <span className="font-medium text-sm">{w.name}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground text-center pt-2">
            By connecting, you agree to Zyra's Terms of Service
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletButton;
