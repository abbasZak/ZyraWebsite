import { useEffect, useRef } from 'react';
import DexLayout from "@/components/dex/DexLayout";

declare global {
  interface Window {
    Jupiter: any;
  }
}

const JupiterSwap = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Jupiter script
    const script = document.createElement('script');
    script.src = 'https://terminal.jup.ag/main-v1.js';
    script.setAttribute('data-preload', '');
    script.async = true;
    
    script.onload = () => {
      if (containerRef.current && window.Jupiter) {
        window.Jupiter.init({
          displayMode: "integrated",
          integratedTargetId: containerRef.current.id,
          endpoint: "https://api.mainnet-beta.solana.com",
          formProps: {
            fixedInputMint: "So11111111111111111111111111111111111111112", // SOL
            fixedOutputMint: "YourTokenMintAddress", // YOUR TOKEN - CHANGE THIS
          },
        });
      }
    };
    
    document.body.appendChild(script);
    
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  return (
    <DexLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
        <div className="w-full max-w-md">
          <h1 className="text-lg font-display font-bold mb-4">Swap with Jupiter</h1>
          <div id="jupiter-terminal" ref={containerRef} style={{ minHeight: '500px' }}></div>
        </div>
      </div>
    </DexLayout>
  );
};

export default JupiterSwap;