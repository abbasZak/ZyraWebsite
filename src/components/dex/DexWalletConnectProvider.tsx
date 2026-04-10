import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { WalletReadyState, type WalletName } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

const PHANTOM_WALLET_NAME = "Phantom" as WalletName<"Phantom">;
const PHANTOM_AUTOCONNECT_PARAM = "phantomAutoConnect";

type DexWalletConnectContextValue = {
  openWalletConnect: () => Promise<void>;
};

const DexWalletConnectContext = createContext<DexWalletConnectContextValue | null>(null);

const isBrowser = () => typeof window !== "undefined";

const getUserAgent = () => (isBrowser() ? window.navigator.userAgent ?? "" : "");

const isMobileBrowser = () => /Android|iPhone|iPad|iPod|Mobile/i.test(getUserAgent());

const isInjectedPhantom = () => {
  if (!isBrowser()) return false;

  const phantomWindow = window as Window & {
    phantom?: { solana?: { isPhantom?: boolean } };
    solana?: { isPhantom?: boolean };
  };

  return Boolean(
    phantomWindow.phantom?.solana?.isPhantom || phantomWindow.solana?.isPhantom
  );
};

const isInsidePhantomBrowser = () => isInjectedPhantom() || /Phantom/i.test(getUserAgent());

const isWalletReady = (readyState?: WalletReadyState) =>
  readyState === WalletReadyState.Installed || readyState === WalletReadyState.Loadable;

const hasPhantomAutoConnectParam = () => {
  if (!isBrowser()) return false;
  return new URL(window.location.href).searchParams.get(PHANTOM_AUTOCONNECT_PARAM) === "1";
};

const clearPhantomAutoConnectParam = () => {
  if (!isBrowser()) return;

  const url = new URL(window.location.href);
  if (!url.searchParams.has(PHANTOM_AUTOCONNECT_PARAM)) return;

  url.searchParams.delete(PHANTOM_AUTOCONNECT_PARAM);
  window.history.replaceState({}, "", url.toString());
};

const buildPhantomReturnUrl = () => {
  const url = new URL(window.location.href);
  url.searchParams.set(PHANTOM_AUTOCONNECT_PARAM, "1");
  return url.toString();
};

const buildPhantomUniversalLink = () => {
  const returnUrl = encodeURIComponent(buildPhantomReturnUrl());
  const ref = encodeURIComponent(window.location.origin);
  return `https://phantom.app/ul/browse/${returnUrl}?ref=${ref}`;
};

export const DexWalletConnectProvider = ({ children }: { children: ReactNode }) => {
  const { wallets, wallet, connected, connecting, select, connect } = useWallet();
  const { setVisible } = useWalletModal();
  const pendingConnectRef = useRef(false);
  const connectAttemptedRef = useRef(false);

  const phantomReadyState = useMemo(
    () => wallets.find(({ adapter }) => adapter.name === PHANTOM_WALLET_NAME)?.readyState,
    [wallets]
  );

  useEffect(() => {
    if (!connected) return;

    pendingConnectRef.current = false;
    connectAttemptedRef.current = false;
    clearPhantomAutoConnectParam();
  }, [connected]);

  useEffect(() => {
    const wantsPhantomConnect = pendingConnectRef.current || hasPhantomAutoConnectParam();

    if (
      !wantsPhantomConnect ||
      connected ||
      connecting ||
      !isInsidePhantomBrowser() ||
      !isWalletReady(phantomReadyState)
    ) {
      return;
    }

    if (wallet?.adapter.name !== PHANTOM_WALLET_NAME) {
      select(PHANTOM_WALLET_NAME);
      return;
    }

    if (connectAttemptedRef.current) return;
    connectAttemptedRef.current = true;

    void connect().catch((error) => {
      console.error("Phantom connection failed:", error);
      pendingConnectRef.current = false;
      connectAttemptedRef.current = false;
      clearPhantomAutoConnectParam();
    });
  }, [connected, connecting, connect, phantomReadyState, select, wallet?.adapter.name]);

  const openWalletConnect = useCallback(async () => {
    if (connected || connecting) return;

    if (isMobileBrowser() && !isInsidePhantomBrowser()) {
      window.location.href = buildPhantomUniversalLink();
      return;
    }

    if (isInsidePhantomBrowser()) {
      pendingConnectRef.current = true;
      connectAttemptedRef.current = false;

      if (wallet?.adapter.name !== PHANTOM_WALLET_NAME) {
        select(PHANTOM_WALLET_NAME);
        return;
      }

      if (isWalletReady(phantomReadyState)) {
        try {
          await connect();
        } catch (error) {
          console.error("Phantom connection failed:", error);
          pendingConnectRef.current = false;
          connectAttemptedRef.current = false;
          clearPhantomAutoConnectParam();
        }
      }

      return;
    }

    setVisible(true);
  }, [connected, connecting, connect, phantomReadyState, select, setVisible, wallet?.adapter.name]);

  const value = useMemo(
    () => ({ openWalletConnect }),
    [openWalletConnect]
  );

  return (
    <DexWalletConnectContext.Provider value={value}>
      {children}
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