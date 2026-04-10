import { useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState, type WalletName } from "@solana/wallet-adapter-base";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";

interface WalletSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const isMobileBrowser = () =>
  typeof window !== "undefined" &&
  /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

const isInsideWalletBrowser = (walletName: string) => {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;

  if (walletName === "Phantom") {
    const w = window as any;
    return Boolean(w.phantom?.solana?.isPhantom || w.solana?.isPhantom) || /Phantom/i.test(ua);
  }
  if (walletName === "Solflare") {
    const w = window as any;
    return Boolean(w.solflare?.isSolflare) || /Solflare/i.test(ua);
  }
  return false;
};

/** Build a universal / deep link that opens the current page inside the wallet's in-app browser */
const buildMobileDeepLink = (walletName: string): string | null => {
  const currentUrl = window.location.href;
  const returnUrl = encodeURIComponent(currentUrl);
  const ref = encodeURIComponent(window.location.origin);

  switch (walletName) {
    case "Phantom":
      return `https://phantom.app/ul/browse/${returnUrl}?ref=${ref}`;
    case "Solflare":
      return `https://solflare.com/ul/v1/browse/${returnUrl}?ref=${ref}`;
    default:
      return null;
  }
};

const WALLET_META: Record<string, { color: string; description: string }> = {
  Phantom: {
    color: "from-[#ab9ff2] to-[#7c3aed]",
    description: "Most popular Solana wallet",
  },
  Solflare: {
    color: "from-[#fc9936] to-[#e8601c]",
    description: "Full-featured Solana wallet",
  },
};

const WalletSelectModal = ({ open, onOpenChange }: WalletSelectModalProps) => {
  const { wallets, select, connect, connected, connecting } = useWallet();

  const handleSelect = useCallback(
    async (walletName: string, readyState: WalletReadyState) => {
      const isMobile = isMobileBrowser();
      const isInside = isInsideWalletBrowser(walletName);

      // On mobile and NOT inside this wallet's browser → deep-link to the app
      if (isMobile && !isInside) {
        const deepLink = buildMobileDeepLink(walletName);
        if (deepLink) {
          window.location.href = deepLink;
          return;
        }
      }

      // Wallet is available (desktop extension or inside wallet browser)
      select(walletName as WalletName);

      if (
        readyState === WalletReadyState.Installed ||
        readyState === WalletReadyState.Loadable
      ) {
        try {
          // Small delay to let adapter register after select
          await new Promise((r) => setTimeout(r, 200));
          await connect();
          onOpenChange(false);
        } catch (err) {
          console.error(`${walletName} connection failed:`, err);
        }
      }
    },
    [select, connect, onOpenChange]
  );

  // Filter to supported wallets
  const supportedWallets = wallets.filter((w) =>
    Object.keys(WALLET_META).includes(w.adapter.name)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-primary/20 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            Connect Wallet
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Choose a wallet to connect to Zyra DEX
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-2">
          {supportedWallets.map((w) => {
            const meta = WALLET_META[w.adapter.name];
            const isInstalled =
              w.readyState === WalletReadyState.Installed ||
              w.readyState === WalletReadyState.Loadable;
            const isMobile = isMobileBrowser();
            const hasDeepLink = !!buildMobileDeepLink(w.adapter.name);

            return (
              <button
                key={w.adapter.name}
                onClick={() => handleSelect(w.adapter.name, w.readyState)}
                disabled={connecting}
                className="group relative flex items-center gap-4 w-full p-4 rounded-xl border border-border/50 
                           hover:border-primary/40 bg-card/50 hover:bg-card/80 transition-all duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Gradient glow on hover */}
                <div
                  className={`absolute inset-0 rounded-xl bg-gradient-to-r ${meta?.color ?? "from-primary to-primary"} 
                              opacity-0 group-hover:opacity-[0.06] transition-opacity`}
                />

                {/* Wallet icon */}
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-background/50 flex items-center justify-center shrink-0">
                  <img
                    src={w.adapter.icon}
                    alt={w.adapter.name}
                    className="w-8 h-8"
                  />
                </div>

                {/* Info */}
                <div className="relative flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-sm">
                      {w.adapter.name}
                    </span>
                    {isInstalled && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        Detected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {meta?.description}
                  </p>
                </div>

                {/* Arrow / deep-link indicator */}
                <div className="relative text-muted-foreground group-hover:text-primary transition-colors">
                  {isMobile && hasDeepLink && !isInstalled ? (
                    <ExternalLink className="w-4 h-4" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {isMobileBrowser() && (
          <p className="text-[11px] text-muted-foreground text-center mt-2">
            You'll be redirected to the wallet app to approve the connection
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WalletSelectModal;
