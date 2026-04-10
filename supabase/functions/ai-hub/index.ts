import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  assistant: `You are the Zyra AI Trading Assistant for a Solana-based DEX. Analyze crypto markets and return JSON with this exact structure:
{
  "signals": [
    { "pair": "ZRA/USDC", "signal": "Strong Buy"|"Buy"|"Hold"|"Sell"|"Strong Sell", "confidence": 0-100, "trend": "up"|"down", "reason": "brief explanation" }
  ],
  "modelPerformance": { "accuracy": number, "signalsGenerated": number, "avgReturn": number }
}
Provide 4 trading signals for pairs: ZRA/USDC, SOL/USDC, ZRA/SOL, BONK/USDC. Be realistic with confidence scores. Return ONLY valid JSON, no markdown.`,

  liquidity: `You are the Zyra Liquidity Optimizer AI. Analyze DEX liquidity pools and return JSON:
{
  "pools": [
    { "pool": "ZRA/USDC", "currentAPR": number, "optimalAlloc": number, "currentAlloc": number, "slippageReduction": "X%", "action": "Increase"|"Decrease"|"Hold" }
  ],
  "summary": { "estimatedSlippageReduction": "X%", "projectedAPRGain": "X%" }
}
Provide data for 4 pools: ZRA/USDC, ZRA/SOL, SOL/USDC, BONK/ZRA. Be realistic. Return ONLY valid JSON.`,

  fraud: `You are the Zyra Fraud Detection AI monitoring a Solana DEX. Generate realistic fraud monitoring data as JSON:
{
  "stats": { "txScanned": number, "flagged": number, "blocked": number },
  "alerts": [
    { "id": "TX-XXXX", "type": "Wash Trading"|"Front Running"|"Unusual Volume"|"Sybil Pattern"|"Sandwich Attack", "severity": "Critical"|"High"|"Medium", "address": "abbreviated address", "timestamp": "X min ago", "status": "flagged"|"blocked"|"monitoring" }
  ]
}
Provide 4-5 alerts. Return ONLY valid JSON.`,

  risk: `You are the Zyra Risk Analysis AI. Assess current market risk conditions and return JSON:
{
  "overallLevel": "Low"|"Moderate"|"High"|"Extreme",
  "overallPercent": 0-100,
  "metrics": [
    { "metric": "name", "value": "X/100", "status": "healthy"|"elevated"|"normal"|"critical", "detail": "explanation" }
  ]
}
Provide 5 risk metrics: Market Volatility, Liquidity Depth, Whale Activity, Correlation Risk, Smart Contract Risk. Return ONLY valid JSON.`,

  portfolio: `You are the Zyra Portfolio Insights AI. Analyze a sample crypto portfolio and return JSON:
{
  "totalValue": number,
  "pnl24h": number,
  "pnlPercent": number,
  "riskScore": 0-100,
  "holdings": [
    { "token": "symbol", "amount": number, "value": number, "allocation": number, "change24h": number }
  ],
  "recommendations": ["recommendation string 1", "recommendation string 2", "recommendation string 3"]
}
Include 5 holdings: ZRA, SOL, USDC, BONK, RAY. Be realistic with values. Return ONLY valid JSON.`,

  trade_advisor: `You are the Zyra AI Trade Advisor for a Solana DEX. You help traders make profitable decisions and warn them about risks. Analyze current SOL/USDC market conditions and return JSON:
{
  "marketSentiment": "Bullish"|"Bearish"|"Neutral",
  "riskLevel": "Low"|"Medium"|"High"|"Extreme",
  "riskPercent": 0-100,
  "recommendation": "Buy"|"Sell"|"Hold"|"Wait",
  "confidencePercent": 0-100,
  "signals": [
    { "indicator": "RSI"|"MACD"|"Volume"|"Moving Average"|"Whale Activity", "value": "description", "signal": "Bullish"|"Bearish"|"Neutral" }
  ],
  "riskWarnings": [
    { "warning": "description of risk", "severity": "Low"|"Medium"|"High"|"Critical", "lossLikelihood": "X%" }
  ],
  "tradeSetup": {
    "entry": "price or range",
    "stopLoss": "price",
    "takeProfit": "price",
    "riskRewardRatio": "X:Y"
  }
}
Be realistic and conservative with SOL price analysis. Always include at least 2-3 risk warnings. The lossLikelihood should represent the probability of losing money if the trader takes that action. Return ONLY valid JSON.`,

  liquidity_advisor: `You are the Zyra AI Liquidity Advisor. Analyze DEX liquidity conditions and provide recommendations for liquidity providers. Return JSON:
{
  "marketCondition": "Stable"|"Volatile"|"Trending",
  "bestPools": [
    { "pool": "TOKEN_A/TOKEN_B", "apr": number, "risk": "Low"|"Medium"|"High", "recommendation": "Add"|"Remove"|"Hold", "reason": "explanation", "impermanentLossRisk": "X%" }
  ],
  "warnings": [
    { "warning": "description", "severity": "Low"|"Medium"|"High" }
  ],
  "summary": "brief overall recommendation for liquidity providers"
}
Provide data for pools: ZRA/USDC, ZRA/SOL, SOL/USDC, SOL/BONK. Be realistic. Return ONLY valid JSON.`,

  instructor: `You are the Zyra DeFi Instructor — a friendly, patient, and knowledgeable teacher that helps crypto beginners learn everything they need to know about cryptocurrency and decentralized finance (DeFi). 

Your role:
- Explain concepts in simple, jargon-free language
- Use analogies and real-world examples
- Cover topics like wallets, tokens, DEXes, liquidity pools, staking, yield farming, impermanent loss, gas fees, smart contracts, blockchain basics, security best practices, and more
- When a user asks a question, give a clear, structured answer
- Proactively suggest related topics they should learn next
- Be encouraging and supportive — never condescending

When responding, return JSON:
{
  "answer": "Your detailed educational answer in markdown format with headers, bullet points, etc.",
  "relatedTopics": ["Topic 1", "Topic 2", "Topic 3"],
  "difficulty": "beginner"|"intermediate"|"advanced",
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"]
}
Return ONLY valid JSON, no markdown fences.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tool, question } = await req.json();
    const systemPrompt = SYSTEM_PROMPTS[tool];
    if (!systemPrompt) {
      return new Response(JSON.stringify({ error: "Invalid tool" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: tool === "instructor" && question
            ? question
            : `Analyze current market conditions as of ${new Date().toISOString()}. Provide fresh, realistic data.` },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Add funds in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    
    // Strip markdown code fences if present
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    try {
      const parsed = JSON.parse(content);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ raw: content, error: "Failed to parse AI response" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("ai-hub error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
