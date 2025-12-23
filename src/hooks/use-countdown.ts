import { useState, useEffect } from "react";

export type CountdownStatus = "pre-launch" | "launched" | "closed";

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function useCountdown() {
  const launchDate = process.env.NEXT_PUBLIC_LAUNCH_DATE || "";
  const closeDate = process.env.NEXT_PUBLIC_CLOSE_DATE || "";

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [status, setStatus] = useState<CountdownStatus>("pre-launch");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      const now = new Date().getTime();
      const launch = new Date(launchDate).getTime();
      const close = new Date(closeDate).getTime();

      if (now < launch) {
        setStatus("pre-launch");
        setIsOpen(false);

        const difference = launch - now;
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else if (now >= launch && now <= close) {
        setStatus("launched");
        setIsOpen(true);

        const difference = close - now;

        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / (1000 * 60)) % 60),
            seconds: Math.floor((difference / 1000) % 60)
          });
        } else {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      } else {
        setStatus("closed");
        setIsOpen(false);
        clearInterval(countdownInterval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [launchDate, closeDate]);

  return {
    timeLeft,
    status,
    isOpen
  };
}
