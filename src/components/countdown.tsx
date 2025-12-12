"use client";

import { useCountdown } from "@/hooks/use-countdown";
import { pluralize } from "@/utils/pluralize";

export function Countdown() {
  const { timeLeft } = useCountdown();

  return (
    <div className="w-full flex flex-col justify-center items-center gap-4">
      {/* Countdown Display */}
      <div className="flex gap-4">
        <div className="relative overflow-hidden flex flex-col gap-2 justify-center items-center w-20 h-24 rounded-2xl bg-gradient-to-b from-background/90 via-background to-background/80 shadow-[0_8px_24px_hsl(var(--primary)/0.4),0_4px_8px_hsl(var(--primary)/0.2),inset_0_1px_0_rgba(255,255,255,0.3)] before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-white/25 before:to-transparent backdrop-blur-lg">
          <span className="text-3xl font-bold text-background-foreground">
            {timeLeft.days}
          </span>
          <span className="text-sm">
            {pluralize(timeLeft.days, "Day", "Days")}
          </span>
        </div>
        <div className="relative overflow-hidden flex flex-col gap-2 justify-center items-center w-20 h-24 rounded-2xl bg-gradient-to-b from-background/90 via-background to-background/80 shadow-[0_8px_24px_hsl(var(--primary)/0.4),0_4px_8px_hsl(var(--primary)/0.2),inset_0_1px_0_rgba(255,255,255,0.3)] before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-white/25 before:to-transparent backdrop-blur-lg">
          <span className="text-3xl font-bold text-background-foreground">
            {timeLeft.hours}
          </span>
          <span className="text-sm">
            {pluralize(timeLeft.hours, "Hour", "Hours")}
          </span>
        </div>
        <div className="relative overflow-hidden flex flex-col gap-2 justify-center items-center w-20 h-24 rounded-2xl bg-gradient-to-b from-background/90 via-background to-background/80 shadow-[0_8px_24px_hsl(var(--primary)/0.4),0_4px_8px_hsl(var(--primary)/0.2),inset_0_1px_0_rgba(255,255,255,0.3)] before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-white/25 before:to-transparent backdrop-blur-lg">
          <span className="text-3xl font-bold text-background-foreground">
            {timeLeft.minutes}
          </span>
          <span className="text-sm">
            {pluralize(timeLeft.minutes, "Minute", "Minutes")}
          </span>
        </div>
        <div className="relative overflow-hidden flex-col gap-2 justify-center items-center w-20 h-24 rounded-2xl bg-gradient-to-b from-background/90 via-background to-background/80 shadow-[0_8px_24px_hsl(var(--primary)/0.4),0_4px_8px_hsl(var(--primary)/0.2),inset_0_1px_0_rgba(255,255,255,0.3)] before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-white/25 before:to-transparent backdrop-blur-lg hidden md:flex">
          <span className="text-3xl font-bold text-background-foreground">
            {timeLeft.seconds}
          </span>
          <span className="text-sm">
            {pluralize(timeLeft.seconds, "Second", "Seconds")}
          </span>
        </div>
      </div>
    </div>
  );
}
