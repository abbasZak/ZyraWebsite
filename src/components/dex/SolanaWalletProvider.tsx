import { useMemo, type ReactNode } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { DexWalletConnectProvider } from "./DexWalletConnectProvider";

interface Props {
  children: ReactNode;
}

const MAINNET_RPC = "https://api.mainnet-beta.solana.com";

const SolanaWalletProvider = ({ children }: Props) => {
  const endpoint = MAINNET_RPC;

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}>
        <DexWalletConnectProvider>{children}</DexWalletConnectProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default SolanaWalletProvider;
