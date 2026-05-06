"use client";

import { motion } from "framer-motion";

const tickerItems = [
  "11 flagship events",
  "Dynamic college onboarding",
  "Approval-based CMS publishing",
  "Real-time admin intelligence",
  "Mobile-first registration engine",
  "Exports, audit, and role control"
];

export function FinanceTicker() {
  return (
    <div className="overflow-hidden rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-2xl">
      <motion.div
        className="flex w-max items-center gap-8 text-xs uppercase tracking-[0.28em] text-white/55"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      >
        {[...tickerItems, ...tickerItems].map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
