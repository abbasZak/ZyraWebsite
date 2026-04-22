// Debug utility for wallet connection
export const debugWallet = () => {
  console.log("=== Wallet Debug Info ===");
  console.log("Window solana:", !!(window as any)?.solana);
  console.log("Is Phantom:", !!(window as any)?.solana?.isPhantom);
  console.log("Is Phantom Mobile:", !!(window as any)?.solana?.isPhantomMobile);
  console.log("Phantom Version:", (window as any)?.solana?.version);
  console.log("Public Key:", (window as any)?.solana?.publicKey?.toString());
  console.log("Is Connected:", (window as any)?.solana?.isConnected);
  console.log("=========================");
};

export const waitForPhantom = (timeout = 5000): Promise<boolean> => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if ((window as any)?.solana?.isPhantom) {
        clearInterval(checkInterval);
        resolve(true);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        resolve(false);
      }
    }, 100);
  });
};