import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Whitepaper from "./pages/Whitepaper.tsx";
import NotFound from "./pages/NotFound.tsx";
import Swap from "./pages/dex/Swap.tsx";
import Trade from "./pages/dex/Trade.tsx";
import Liquidity from "./pages/dex/Liquidity.tsx";
import Staking from "./pages/dex/Staking.tsx";
import AIHub from "./pages/dex/AIHub.tsx";
import Governance from "./pages/dex/Governance.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/whitepaper" element={<Whitepaper />} />
          <Route path="/dex" element={<Swap />} />
          <Route path="/dex/trade" element={<Trade />} />
          <Route path="/dex/liquidity" element={<Liquidity />} />
          <Route path="/dex/staking" element={<Staking />} />
          <Route path="/dex/governance" element={<Governance />} />
          <Route path="/dex/ai" element={<AIHub />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
