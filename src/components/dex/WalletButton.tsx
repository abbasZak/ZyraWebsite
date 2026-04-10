import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useMemo } from "react";
import { Wallet, ChevronDown, Copy, LogOut, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useDexWalletConnect } from "./DexWalletConnectProvider";

const WalletButton = () => {
  const { publicKey, wallet, disconnect, connected, connecting } = useWallet();
  const { toast } = useToast();
  const { openWalletConnect } = useDexWalletConnect();

  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);
  const displayAddress = useMemo(() => {
    if (!base58) return "";
    return base58.slice(0, 4) + "..." + base58.slice(-4);
  }, [base58]);

  const copyAddress = useCallback(() => {
    if (base58) {
      navigator.clipboard.writeText(base58);
      toast({ title: "Address copied", description: base58 });
    }
  }, [base58, toast]);

  const openExplorer = useCallback(() => {
    if (base58) {
      window.open(`https://solscan.io/account/${base58}`, "_blank");
    }
  }, [base58]);

  const handleDisconnect = useCallback(async () => {
    await disconnect();
    toast({ title: "Wallet disconnected" });
  }, [disconnect, toast]);

  if (connected && base58) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:border-primary/40 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {wallet?.adapter.icon && (
              <img src={wallet.adapter.icon} alt="" className="w-4 h-4" />
            )}
            {displayAddress}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 glass-strong">
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
      className="gap-2 glow-sm"
      onClick={() => void openWalletConnect()}
      disabled={connecting}
    >
      <Wallet className="w-4 h-4" />
      {connecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
};

export default WalletButton;
