import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import WalletSelectModal from "./WalletSelectModal";

type DexWalletConnectContextValue = {
  openWalletConnect: () => void;
  closeWalletConnect: () => void;
};

const DexWalletConnectContext = createContext<DexWalletConnectContextValue | null>(null);

export const DexWalletConnectProvider = ({ children }: { children: ReactNode }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const openWalletConnect = useCallback(() => setModalOpen(true), []);
  const closeWalletConnect = useCallback(() => setModalOpen(false), []);

  const value = useMemo(
    () => ({ openWalletConnect, closeWalletConnect }),
    [closeWalletConnect, openWalletConnect]
  );

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
