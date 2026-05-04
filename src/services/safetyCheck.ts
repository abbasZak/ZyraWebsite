export interface SafetyResult {
  isSafe: boolean;
  riskScore: number;        // 0 = very safe, 100 = very dangerous
  warnings: string[];
  recommendations: string[];
  timestamp: number;
}

export interface TokenToCheck {
  mint: string;
  symbol: string;
  name: string;
}

// Main function to check a token's safety
export async function checkTokenSafety(token: TokenToCheck): Promise<SafetyResult> {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let riskScore = 0;
  
  console.log(`🔍 Starting safety check for ${token.symbol} (${token.mint})`);
  
  // Step 1: Check if this is a known scam token (using local list)
  const isKnownScam = await checkKnownScamTokens(token.mint);
  if (isKnownScam) {
    warnings.push("⚠️ This token has been reported as a potential scam");
    riskScore += 50;
    recommendations.push("Avoid trading this token");
  }
  
  // Step 2: Check token contract risks via RugCheck.xyz
  try {
    const rugCheckResult = await checkRugPullRisk(token.mint);
    if (rugCheckResult.hasRisk) {
      warnings.push(`🚨 ${rugCheckResult.warning}`);
      riskScore += rugCheckResult.riskPoints;
      recommendations.push(rugCheckResult.recommendation);
    }
  } catch (error) {
    console.log("RugCheck API failed, continuing with other checks");
  }
  
  // Step 3: Check liquidity and market data via DexScreener
  try {
    const marketData = await getTokenMarketData(token.mint);
    if (marketData) {
      if (marketData.liquidity < 50000) {  // Less than $50k liquidity
        warnings.push("💰 Very low liquidity - token could be easily manipulated");
        riskScore += 30;
        recommendations.push("Only trade small amounts if you must");
      }
      
      if (marketData.priceChange24h < -30) {  // Dropped more than 30% in 24h
        warnings.push("📉 Token dropped over 30% in 24 hours");
        riskScore += 20;
        recommendations.push("Wait for price to stabilize");
      }
      
      if (marketData.priceChange24h > 100) {  // Pumped more than 100%
        warnings.push("🚀 Extreme price pump - potential rug or honeypot");
        riskScore += 25;
        recommendations.push("Be extremely careful");
      }
    }
  } catch (error) {
    console.log("DexScreener API failed");
  }
  
  // Step 4: Final determination
  const isSafe = riskScore < 40;  // Under 40 is considered safe
  
  return {
    isSafe,
    riskScore: Math.min(riskScore, 100),  // Cap at 100
    warnings,
    recommendations: recommendations.slice(0, 3),  // Max 3 recommendations
    timestamp: Date.now(),
  };
}

// Helper: Check known scam tokens (you can add more as you discover them)
async function checkKnownScamTokens(mint: string): Promise<boolean> {
  // This is a local list. You can expand this from a database later
  const knownScams: string[] = [
    // Add known scam token mints here as you find them
    // "ExampleScamTokenMintAddress"
  ];
  return knownScams.includes(mint);
}

// Helper: Check rug pull risk via RugCheck.xyz (free API)
async function checkRugPullRisk(mint: string): Promise<{ hasRisk: boolean; warning: string; riskPoints: number; recommendation: string }> {
  try {
    // RugCheck.xyz has a free public API
    const response = await fetch(`https://api.rugcheck.xyz/v1/tokens/${mint}/report`);
    
    if (!response.ok) {
      throw new Error(`RugCheck API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check for risky findings
    if (data.risks && data.risks.length > 0) {
      const highRisks = data.risks.filter((r: any) => r.level === "DANGER" || r.level === "WARNING");
      
      if (highRisks.length > 0) {
        const riskNames = highRisks.map((r: any) => r.name).join(", ");
        return {
          hasRisk: true,
          warning: `Contract risk: ${riskNames}`,
          riskPoints: 40,
          recommendation: "Review the contract before trading"
        };
      }
    }
    
    // Check if mint/freeze authority is still active (big red flag!)
    if (data.mintAuthority !== "disabled" && data.mintAuthority !== null) {
      return {
        hasRisk: true,
        warning: "⚠️ Mint authority still active - creator can create unlimited tokens!",
        riskPoints: 60,
        recommendation: "DO NOT BUY - This is a potential rug pull"
      };
    }
    
    if (data.freezeAuthority !== "disabled" && data.freezeAuthority !== null) {
      return {
        hasRisk: true,
        warning: "❄️ Freeze authority still active - creator can freeze your tokens!",
        riskPoints: 50,
        recommendation: "Avoid this token"
      };
    }
    
    return { hasRisk: false, warning: "", riskPoints: 0, recommendation: "" };
    
  } catch (error) {
    console.error("RugCheck API error:", error);
    return { hasRisk: false, warning: "", riskPoints: 0, recommendation: "" };
  }
}

// Helper: Get market data from DexScreener (free API)
async function getTokenMarketData(mint: string): Promise<{ liquidity: number; priceChange24h: number; volume24h: number } | null> {
  try {
    // For Solana tokens, we need to use the correct API endpoint
    const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${mint}`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (data.pairs && data.pairs.length > 0) {
      const firstPair = data.pairs[0];
      
      return {
        liquidity: parseFloat(firstPair.liquidity?.usd || "0"),
        priceChange24h: parseFloat(firstPair.priceChange?.h24 || "0"),
        volume24h: parseFloat(firstPair.volume?.h24 || "0"),
      };
    }
    
    return null;
    
  } catch (error) {
    console.error("DexScreener API error:", error);
    return null;
  }
}