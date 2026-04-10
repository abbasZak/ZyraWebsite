import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { WalletReadyState, type WalletName } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import WalletSelectModal from "./WalletSelectModal";

const PHANTOM_WALLET_NAME = "Phantom" as WalletName<"Phantom">;
const AUTOCONNECT_PARAM = "walletAutoConnect";

type DexWalletConnectContextValue = {
  openWalletConnect: () => void;
};

const DexWalletConnectContext = createContext<DexWalletConnectContextValue | null>(null);

const isBrowser = () => typeof window !== "undefined";

const isInsideWalletBrowser = () => {
  if (!isBrowser()) return false;
  const w = window as any;
  const ua = navigator.userAgent;
  return Boolean(w.phantom?.solana?.isPhantom || w.solana?.isPhantom) || /Phantom|Solflare/i.test(ua);
};

const isWalletReady = (readyState?: WalletReadyState) =>
  readyState === WalletReadyState.Installed || readyState === WalletReadyState.Loadable;

export const DexWalletConnectProvider = ({ children }: { children: ReactNode }) => {
  const { wallets, wallet, connected, connecting, select, connect } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);
  const connectAttemptedRef = useRef(false);

  // Auto-connect when inside a wallet's in-app browser
  useEffect(() => {
    if (connected || connecting || !isInsideWalletBrowser()) return;

    // Find the first ready wallet
    const readyWallet = wallets.find((w) => isWalletReady(w.readyState));
    if (!readyWallet) return;

    if (wallet?.adapter.name !== readyWallet.adapter.name) {
      select(readyWallet.adapter.name as WalletName);
      return;
    }

    if (connectAttemptedRef.current) return;
    connectAttemptedRef.current = true;

    void connect().catch((err) => {
      console.error("Auto-connect failed:", err);
      connectAttemptedRef.current = false;
    });
  }, [connected, connecting, connect, wallets, select, wallet?.adapter.name]);

  useEffect(() => {
    if (connected) connectAttemptedRef.current = false;
  }, [connected]);

  const openWalletConnect = useCallback(() => {
    if (connected || connecting) return;
    setModalOpen(true);
  }, [connected, connecting]);

  const value = useMemo(() => ({ openWalletConnect }), [openWalletConnect]);

  return (
    <DexWalletConnectContext.Provider value={value}>
      {children}
      <WalletSelectModal open={modalOpen} onOpenChange={setModalOpen} />
    </DexWalletConnectContext.Provider>
  );
};

export const useDexWalletConnect = () => {
  const context = useContext(DexWalletConnectContext);
  if (!context) {
    throw new Error("useDexWalletConnect must be used within DexWalletConnectProvider");
  }
  return context;
};
