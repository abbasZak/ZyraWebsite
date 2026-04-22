// Jupiter API service
const JUPITER_API = '/api/jupiter';

export interface QuoteResponse {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: string;
  routePlan: any[];
  swapInfo?: any;
}

export interface TokenPrice {
  mint: string;
  price: number;
}

export const jupiterApi = {
  // Get quote for swap
  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 100
  ): Promise<QuoteResponse | null> {
    try {
      const params = new URLSearchParams({
        inputMint,
        outputMint,
        amount: amount.toString(),
        slippageBps: slippageBps.toString(),
      });

      const response = await fetch(`${JUPITER_API}/quote?${params}`);
      
      if (!response.ok) {
        throw new Error(`Quote failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to get quote:", error);
      return null;
    }
  },

  // Get token prices
  async getTokenPrices(mints: string[]): Promise<Record<string, number>> {
    try {
      const response = await fetch(`https://api.jup.ag/price/v2?ids=${mints.join(',')}`);
      if (response.ok) {
        const data = await response.json();
        const prices: Record<string, number> = {};
        mints.forEach(mint => {
          if (data.data && data.data[mint]) {
            prices[mint] = data.data[mint].price;
          }
        });
        return prices;
      }
      return {};
    } catch (error) {
      console.error("Failed to get prices:", error);
      return {};
    }
  },

  // Get swap transaction
  async getSwapTransaction(
    quoteResponse: QuoteResponse,
    userPublicKey: string,
    slippageBps: number = 100
  ): Promise<string | null> {
    try {
      const response = await fetch(`${JUPITER_API}/swap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey,
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: "auto",
          slippageBps,
        }),
      });

      if (!response.ok) {
        throw new Error(`Swap transaction failed: ${response.status}`);
      }

      const data = await response.json();
      return data.swapTransaction;
    } catch (error) {
      console.error("Failed to get swap transaction:", error);
      return null;
    }
  },
};