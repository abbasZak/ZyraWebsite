import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const WalletTest = () => {
  const [status, setStatus] = useState("Checking...");
  const [publicKey, setPublicKey] = useState<string | null>(null);

  useEffect(() => {
    const checkPhantom = () => {
      const solana = (window as any)?.solana;
      if (solana?.isPhantom) {
        setStatus("✅ Phantom detected");
        setPublicKey(solana.publicKey?.toString() || null);
      } else {
        setStatus("❌ Phantom not detected");
      }
    };
    
    checkPhantom();
    
    // Listen for Phantom events
    window.addEventListener('phantom-ready', checkPhantom);
    return () => window.removeEventListener('phantom-ready', checkPhantom);
  }, []);

  const connect = async () => {
    try {
      const solana = (window as any)?.solana;
      if (!solana) {
        alert("Phantom not installed");
        return;
      }
      
      const response = await solana.connect();
      setPublicKey(response.publicKey.toString());
      setStatus("✅ Connected!");
    } catch (err) {
      console.error(err);
      setStatus("❌ Connection failed");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Wallet Test</h1>
      <div className="mb-4">Status: {status}</div>
      <div className="mb-4">Public Key: {publicKey || "Not connected"}</div>
      <Button onClick={connect}>Connect Phantom</Button>
    </div>
  );
};

export default WalletTest;