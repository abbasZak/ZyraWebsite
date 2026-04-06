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
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
        <span className="text-sm font-medium text-primary">
          {isLive ? "Live" : `${time.days}d ${String(time.hours).padStart(2, "0")}:${String(time.minutes).padStart(2, "0")}:${String(time.seconds).padStart(2, "0")}`}
        </span>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-[0.2em] mb-4">
        {isLive ? "Presale is Live — Ends in" : "Presale Starts in"}
      </p>
      <div className="flex gap-2 sm:gap-3 justify-center">
        {units.map((u, i) => (
          <div key={u.label} className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground font-display tabular-nums glass rounded-xl w-14 h-14 sm:w-16 sm:h-16 md:w-[4.5rem] md:h-[4.5rem] flex items-center justify-center gradient-border">
                {String(u.value).padStart(2, "0")}
              </span>
              <span className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-widest">{u.label}</span>
            </div>
            {i < units.length - 1 && (
              <span className="text-xl text-muted-foreground/30 font-light mb-5">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PresaleCountdown;
