"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { pluralize } from "@/utils/pluralize";
import { useQuota } from "@/hooks/use-quota";

export function Quota() {
  const { available, loading } = useQuota();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (loading || available == null) return;

    const duration = 600;
    const steps = 24;
    const increment = available / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= available) {
        setDisplay(available);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [loading, available]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xl font-semibold text-muted-foreground text-center mt-12"
      >
        Checking Quota…
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col gap-2 text-center mt-12"
    >
      <span className="text-xl font-semibold text-muted-foreground tracking-wide">
        Quota Available
      </span>

      <motion.span
        key={display}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="text-6xl font-black tabular-nums"
      >
        {display}
      </motion.span>

      <span className="text-base font-light text-muted-foreground">
        {pluralize(display, "Capsule", "Capsules")}
      </span>
    </motion.div>
  );
}
