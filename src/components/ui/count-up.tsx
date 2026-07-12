"use client";

import { useEffect, useRef, useState } from "react";

export function CountUp({
  value,
  format,
  durationMs = 600,
}: {
  value: number;
  format?: (value: number) => string;
  durationMs?: number;
}) {
  const [display, setDisplay] = useState(value);
  const previousRef = useRef(value);

  useEffect(() => {
    const from = previousRef.current;
    const to = value;
    previousRef.current = value;
    if (from === to) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      if (reduced) {
        setDisplay(to);
        return;
      }
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs]);

  return <>{format ? format(display) : Math.round(display)}</>;
}
