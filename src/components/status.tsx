"use client";

import { motion } from "framer-motion";
import { useCountdown } from "@/hooks/use-countdown";
import { Clock, Rocket, Lock } from "lucide-react";

export function Status() {
  const { status } = useCountdown();

  if (!status) return null;

  const config = {
    "pre-launch": {
      label: "Opening Soon",
      colors: "from-blue-500 to-cyan-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      text: "text-blue-600"
    },
    launched: {
      label: "Open for Submissions",
      colors: "from-green-500 to-emerald-500",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      text: "text-green-600"
    },
    closed: {
      label: "Capsule Sealed",
      colors: "from-gray-500 to-slate-500",
      bg: "bg-gray-500/10",
      border: "border-gray-500/20",
      text: "text-gray-600"
    }
  };

  const { label, colors, bg, border, text } = config[status];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${bg} ${border} border backdrop-blur-sm mb-12 relative overflow-hidden`}
    >
      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${colors} opacity-5`}
      />

      <motion.div
        className={`w-2 h-2 rounded-full bg-gradient-to-r ${colors}`}
        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <span className={`text-sm font-medium ${text}`}>{label}</span>
    </motion.div>
  );
}
