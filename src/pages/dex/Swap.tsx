import { useState } from "react";
import { ArrowDownUp, Settings, Info, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import DexLayout from "@/components/dex/DexLayout";

const tokens = [
  { symbol: "SOL", name: "Solana", price: 178.42, icon: "◎" },
  { symbol: "ZRA", name: "Zyra", price: 0.20, icon: "⚡" },
  { symbol: "USDC", name: "USD Coin", price: 1.00, icon: "💲" },
  { symbol: "USDT", name: "Tether", price: 1.00, icon: "💵" },
];

const Swap = () => {
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);

  const toAmount = fromAmount
    ? ((parseFloat(fromAmount) * fromToken.price) / toToken.price).toFixed(4)
    : "";

  const flipTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount("");
  };

  return (
    <DexLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-display font-bold">Swap</h1>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>

          <div className="glass rounded-2xl p-4 space-y-1 gradient-border">
            {/* From */}
            <div className="bg-secondary/30 rounded-xl p-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>You pay</span>
                <span>Balance: 0.00</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="flex-1 bg-transparent text-2xl font-bold outline-none placeholder:text-muted-foreground/30 w-0"
                />
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors shrink-0">
                  <span>{fromToken.icon}</span>
                  <span className="font-semibold text-sm">{fromToken.symbol}</span>
                </button>
              </div>
              {fromAmount && (
                <p className="text-xs text-muted-foreground mt-1">
                  ≈ ${(parseFloat(fromAmount) * fromToken.price).toFixed(2)}
                </p>
              )}
            </div>

            {/* Flip button */}
            <div className="flex justify-center -my-3 relative z-10">
              <button
                onClick={flipTokens}
                className="w-9 h-9 rounded-xl bg-secondary border-2 border-background flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <ArrowDownUp className="w-4 h-4" />
              </button>
            </div>

            {/* To */}
            <div className="bg-secondary/30 rounded-xl p-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>You receive</span>
                <span>Balance: 0.00</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="0.00"
                  value={toAmount}
                  readOnly
                  className="flex-1 bg-transparent text-2xl font-bold outline-none placeholder:text-muted-foreground/30 w-0"
                />
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors shrink-0">
                  <span>{toToken.icon}</span>
                  <span className="font-semibold text-sm">{toToken.symbol}</span>
                </button>
              </div>
              {toAmount && (
                <p className="text-xs text-muted-foreground mt-1">
                  ≈ ${(parseFloat(toAmount) * toToken.price).toFixed(2)}
                </p>
              )}
            </div>

            {/* Details */}
            {fromAmount && (
              <div className="pt-3 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1"><Info className="w-3 h-3" />Rate</span>
                  <span>1 {fromToken.symbol} = {(fromToken.price / toToken.price).toFixed(4)} {toToken.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span>Slippage</span>
                  <span>{slippage}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Network Fee</span>
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-primary" />~$0.002</span>
                </div>
              </div>
            )}

            {/* CTA */}
            <Button className="w-full mt-3 h-12 text-base font-semibold glow-sm" size="lg">
              Connect Wallet to Swap
            </Button>
          </div>

          {/* Slippage selector */}
          <div className="mt-3 flex items-center gap-2 justify-center">
            <span className="text-xs text-muted-foreground">Slippage:</span>
            {[0.1, 0.5, 1.0].map((s) => (
              <button
                key={s}
                onClick={() => setSlippage(s)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                  slippage === s
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-secondary/50"
                }`}
              >
                {s}%
              </button>
            ))}
          </div>
        </div>
      </div>
    </DexLayout>
  );
};

export default Swap;
