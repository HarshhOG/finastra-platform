"use client";

import { useEffect, useState } from "react";

function getCountdown(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  const clamped = Math.max(diff, 0);

  return {
    days: Math.floor(clamped / (1000 * 60 * 60 * 24)),
    hours: Math.floor((clamped / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((clamped / (1000 * 60)) % 60)
  };
}

export function CountdownTimer({
  target
}: {
  target: string | null;
}) {
  const [countdown, setCountdown] = useState(() =>
    target ? getCountdown(target) : { days: 0, hours: 0, minutes: 0 }
  );

  useEffect(() => {
    if (!target) {
      return;
    }

    const timer = window.setInterval(() => {
      setCountdown(getCountdown(target));
    }, 60_000);

    setCountdown(getCountdown(target));

    return () => window.clearInterval(timer);
  }, [target]);

  if (!target) {
    return null;
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: "Days", value: countdown.days },
        { label: "Hours", value: countdown.hours },
        { label: "Minutes", value: countdown.minutes }
      ].map((item) => (
        <div key={item.label} className="rounded-[24px] border border-white/10 bg-white/6 p-4 text-center">
          <p className="font-[var(--font-display)] text-3xl font-semibold text-white">{item.value}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-white/42">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
