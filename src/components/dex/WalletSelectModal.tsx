import { useCallback, useMemo } from "react";
import { WalletReadyState, type WalletName } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { AlertTriangle, Loader2, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface WalletSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SUPPORTED_WALLETS = new Set(["Phantom", "Solflare"]);

const isMobileBrowser = () =>
  typeof window !== "undefined" &&
  /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

const isInsideWalletBrowser = (walletName: string) => {
  if (typeof window === "undefined") return false;

  const win = window as Window & {
    phantom?: { solana?: { isPhantom?: boolean } };
    solana?: { isPhantom?: boolean };
    solflare?: { isSolflare?: boolean };
  };
  const ua = navigator.userAgent;

  if (walletName === "Phantom") {
    return Boolean(win.phantom?.solana?.isPhantom || win.solana?.isPhantom) || /Phantom/i.test(ua);
  }

  if (walletName === "Solflare") {
    return Boolean(win.solflare?.isSolflare) || /Solflare/i.test(ua);
  }

  return false;
};

const DEEPLINK_URLS: Record<string, (appUrl: string) => string> = {
  Phantom: (appUrl) =>
    `https://phantom.app/ul/browse/${encodeURIComponent(appUrl)}?ref=${encodeURIComponent(appUrl)}`,
  Solflare: (appUrl) =>
    `https://solflare.com/ul/v1/browse/${encodeURIComponent(appUrl)}?ref=${encodeURIComponent(appUrl)}`,
};

const canConnectInCurrentBrowser = (walletName: string, readyState: WalletReadyState) => {
  if (readyState === WalletReadyState.Installed) return true;
  if (readyState === WalletReadyState.Loadable) return true;
  // On mobile, we can deep-link even if not installed/loadable
  if (isMobileBrowser() && DEEPLINK_URLS[walletName]) return true;
  return false;
};

const getWalletHint = (walletName: string, readyState: WalletReadyState) => {
  if (readyState === WalletReadyState.Installed) return "Connect now";
  if (readyState === WalletReadyState.Loadable) return "Connect now";

  if (isMobileBrowser() && DEEPLINK_URLS[walletName]) {
    return `Tap to open in ${walletName}`;
  }

  return `Install the ${walletName} extension`;
};

const WalletSelectModal = ({ open, onOpenChange }: WalletSelectModalProps) => {
  const { wallets, select, connect, connecting } = useWallet();
  const { toast } = useToast();

  const supportedWallets = useMemo(
    () => wallets.filter((wallet) => SUPPORTED_WALLETS.has(wallet.adapter.name)),
    [wallets]
  );

  const handleSelect = useCallback(
    async (walletName: string, readyState: WalletReadyState) => {
      if (connecting) return;

      // Mobile deep-link: wallet not injected, open the wallet's in-app browser
      if (
        isMobileBrowser() &&
        !isInsideWalletBrowser(walletName) &&
        readyState !== WalletReadyState.Installed &&
        readyState !== WalletReadyState.Loadable &&
        DEEPLINK_URLS[walletName]
      ) {
        const appUrl = window.location.href;
        window.location.href = DEEPLINK_URLS[walletName](appUrl);
        return;
      }

      // Extension or in-app browser: connect directly
      try {
        select(walletName as WalletName);
        await new Promise((resolve) => setTimeout(resolve, 150));
        await connect();
        onOpenChange(false);
      } catch (error: any) {
        console.error(`${walletName} connection failed`, error);
        toast({
          title: `${walletName} connection failed`,
          description: error?.message || "Approve the connection in your wallet and try again.",
          variant: "destructive",
        });
      }
    },
    [connect, connecting, onOpenChange, select, toast]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border/60 bg-background/95">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet to connect. On mobile, you'll be redirected to the wallet app.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {supportedWallets.map(({ adapter, readyState }) => {
            const canConnect = canConnectInCurrentBrowser(adapter.name, readyState);
            const detected = readyState === WalletReadyState.Installed;

            return (
              <button
                key={adapter.name}
                type="button"
                onClick={() => void handleSelect(adapter.name, readyState)}
                disabled={connecting}
                className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card/50 p-4 text-left transition-colors hover:border-primary/40 hover:bg-secondary/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <img src={adapter.icon} alt={`${adapter.name} logo`} className="h-10 w-10 rounded-lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{adapter.name}</span>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {detected ? "Detected" : canConnect ? "Ready" : "Manual"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{getWalletHint(adapter.name, readyState)}</p>
                </div>
                {connecting ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            );
          })}
        </div>

        {isMobileBrowser() && (
          <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-secondary/20 p-3 text-xs text-muted-foreground">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>On mobile, tapping a wallet will open it so you can approve the connection and return here.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WalletSelectModal;
