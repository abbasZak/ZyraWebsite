import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { TorusWalletAdapter } from "@solana/wallet-adapter-torus";
import { useMemo } from "react";
import { AuthProvider } from "./components/auth/AuthProvider";
import Index from "./pages/Index.tsx";
import Whitepaper from "./pages/Whitepaper.tsx";
import NotFound from "./pages/NotFound.tsx";
import Swap from "./pages/dex/Swap.tsx";
import Trade from "./pages/dex/Trade.tsx";
import AddLiquidity from "./pages/dex/AddLiquidity.tsx";  
import RemoveLiquidity from "./pages/dex/RemoveLiquidity.tsx";
import Staking from "./pages/dex/Staking.tsx";
import AIHub from "./pages/dex/AIHub.tsx";
import Governance from "./pages/dex/Governance.tsx";
import AuthPage from "./components/auth/AuthPage.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";

// import "@solana/wallet-adapter-react-ui/styles.css";

const queryClient = new QueryClient();
const SOLANA_RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";

const App = () => {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider endpoint={SOLANA_RPC_ENDPOINT}>
        <WalletProvider wallets={wallets} autoConnect={false}>
          <WalletModalProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AuthProvider>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/whitepaper" element={<Whitepaper />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/dex" element={<Swap />} />
                    <Route path="/dex/trade" element={<Trade />} />
                    <Route path="/dex/liquidity" element={<AddLiquidity />} />  
                    <Route path="/dex/remove-liquidity" element={<RemoveLiquidity />} />
                    <Route path="/dex/staking" element={<Staking />} />
                    <Route path="/dex/governance" element={<Governance />} />
                    <Route path="/dex/ai" element={<AIHub />} />
                    <Route path="*" element={<NotFound />} />
                   
                  </Routes>
                </AuthProvider>
              </BrowserRouter>
            </TooltipProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </QueryClientProvider>
  );
};

export default App;