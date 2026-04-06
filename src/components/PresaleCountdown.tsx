import { useState, useEffect } from "react";

const PRESALE_START = new Date("2026-06-01T00:00:00Z").getTime();
const PRESALE_END = new Date("2026-08-31T23:59:59Z").getTime();

const getTimeLeft = (target: number) => {
  const now = Date.now();
  const diff = Math.max(0, target - now);
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

interface Props {
  compact?: boolean;
}

const PresaleCountdown = ({ compact = false }: Props) => {
  const now = Date.now();
  const isLive = now >= PRESALE_START && now <= PRESALE_END;
  const target = isLive ? PRESALE_END : PRESALE_START;
  const [time, setTime] = useState(getTimeLeft(target));

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => clearInterval(interval);
  }, [target]);

  const units = [
    { label: "Days", value: time.days },
    { label: "Hrs", value: time.hours },
    { label: "Min", value: time.minutes },
    { label: "Sec", value: time.seconds },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
        <span className="text-sm font-semibold text-primary">
          {isLive ? "Presale Live" : "Presale in"}{" "}
          {time.days}d {String(time.hours).padStart(2, "0")}:{String(time.minutes).padStart(2, "0")}:{String(time.seconds).padStart(2, "0")}
        </span>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-sm font-medium text-primary mb-3">
        {isLive ? "🔥 Presale is LIVE — Ends in" : "⏳ Presale Starts in"}
      </p>
      <div className="flex gap-3 justify-center">
        {units.map((u) => (
          <div key={u.label} className="flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-bold text-foreground bg-card border border-border rounded-lg w-14 h-14 md:w-16 md:h-16 flex items-center justify-center">
              {String(u.value).padStart(2, "0")}
            </span>
            <span className="text-xs text-muted-foreground mt-1">{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PresaleCountdown;
