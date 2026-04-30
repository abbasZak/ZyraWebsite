import { useState, useEffect, useRef } from 'react';
import DexLayout from "@/components/dex/DexLayout";
import IdentityVerification from "@/components/IdentityVerification";
import { useWallet } from "@solana/wallet-adapter-react";

const JupiterSwap = () => {
  const [isVerified, setIsVerified] = useState(false);
  const { publicKey, connected } = useWallet();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVerified) return;
    
    const script = document.createElement('script');
    script.src = 'https://terminal.jup.ag/main-v1.js';
    script.setAttribute('data-preload', '');
    
    script.onload = () => {
      if (containerRef.current && window.Jupiter) {
        window.Jupiter.init({
          displayMode: "integrated",
          integratedTargetId: containerRef.current.id,
          endpoint: "https://api.mainnet-beta.solana.com",
        });
      }
    };
    
    document.body.appendChild(script);
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [isVerified]);

  return (
    <DexLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
        <div className="w-full max-w-md">
          {!isVerified ? (
            <IdentityVerification 
              onVerified={() => setIsVerified(true)}
              walletAddress={publicKey?.toBase58() || null}
            />
          ) : (
            <>
              <h1 className="text-lg font-display font-bold mb-4">Swap on Jupiter</h1>
              <div id="jupiter-terminal" ref={containerRef} style={{ minHeight: '500px' }}></div>
            </>
          )}
        </div>
      </div>
    </DexLayout>
  );
};

export default JupiterSwap;