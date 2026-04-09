import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Solana token mint addresses (mainnet)
const TOKEN_MINTS: Record<string, string> = {
  SOL: "So11111111111111111111111111111111111111112",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  BONK: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  RAY: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
  JUP: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
  ORCA: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE",
  WIF: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
  JTO: "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL",
  PYTH: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3",
  MNGO: "MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { inputMint, outputMint, amount, slippageBps } = await req.json();

    if (!inputMint || !outputMint || !amount) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: inputMint, outputMint, amount" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Resolve symbol to mint address if needed
    const resolvedInput = TOKEN_MINTS[inputMint] || inputMint;
    const resolvedOutput = TOKEN_MINTS[outputMint] || outputMint;

    // Call Jupiter Quote API v6
    const params = new URLSearchParams({
      inputMint: resolvedInput,
      outputMint: resolvedOutput,
      amount: amount.toString(),
      slippageBps: (slippageBps || 50).toString(),
      onlyDirectRoutes: "false",
      asLegacyTransaction: "false",
    });

    const quoteResp = await fetch(`https://quote-api.jup.ag/v6/quote?${params}`);

    if (!quoteResp.ok) {
      const errText = await quoteResp.text();
      console.error("Jupiter quote error:", quoteResp.status, errText);
      return new Response(
        JSON.stringify({ error: "Failed to get quote", detail: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const quoteData = await quoteResp.json();

    return new Response(JSON.stringify(quoteData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("swap-quote error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
