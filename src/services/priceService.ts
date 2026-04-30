export const fetchTokenPrices = async (mints: string[]): Promise<Record<string, number>> => {
  try {
    // Use Jupiter Price API
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
    throw new Error('Price fetch failed');
  } catch (error) {
    console.error("Failed to fetch prices:", error);
    return {};
  }
};