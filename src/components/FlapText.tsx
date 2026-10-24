"use client";

import { useEffect, useRef, useState } from "react";
import { clack } from "@/lib/sound";

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function normalize(text: string, length?: number) {
  const up = text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase();
  if (!length) return up;
  return up.length > length ? up.slice(0, length - 1) + "…" : up.padEnd(length, " ");
}

/**
 * A row of split-flap tiles. When the text changes, each tile riffles through
 * random characters before landing, staggered left to right like the real board.
 */
export function FlapText({
  text,
  length,
  size = "md",
  tone = "flap",
  className = "",
  delay = 0,
}: {
  text: string;
  length?: number;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  tone?: "flap" | "sun" | "mint" | "coral";
  className?: string;
  delay?: number;
}) {
  const target = normalize(text, length);
  const [shown, setShown] = useState<string[]>(() => [...target].map(() => " "));
  const [flips, setFlips] = useState<number[]>(() => [...target].map(() => 0));
  // what the tiles currently show, readable from timers without re-running the effect
  const current = useRef<string[]>([...target].map(() => " "));

  useEffect(() => {
    const goal = [...target];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const remaining = goal.map((ch, i) =>
      current.current[i] === ch || reduce ? 0 : 2 + Math.floor(i * 0.7) + Math.floor(Math.random() * 3),
    );
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      let busy = false;
      const next = goal.map((ch, i) => {
        if (remaining[i] <= 0) return ch;
        busy = true;
        remaining[i]--;
        return remaining[i] === 0 ? ch : CHARSET[Math.floor(Math.random() * CHARSET.length)];
      });
      const changed = next.map((ch, i) => ch !== current.current[i]);
      current.current = next;
      setShown(next);
      setFlips((f) => next.map((_, i) => (f[i] ?? 0) + (changed[i] ? 1 : 0)));
      if (busy) {
        clack();
        timer = setTimeout(tick, 62);
      }
    };
    timer = setTimeout(tick, reduce ? 0 : delay);
    return () => clearTimeout(timer);
  }, [target, delay]);

  return (
    <span className={`flap-row flap-${size} flap-tone-${tone} ${className}`} aria-label={text.trim()} role="text">
      {shown.map((ch, i) => (
        <span key={i} className="flap" aria-hidden>
          <span className="flap-half flap-top">{ch === " " ? " " : ch}</span>
          <span className="flap-half flap-bottom">{ch === " " ? " " : ch}</span>
          {flips[i] > 0 && <span key={flips[i]} className="flap-half flap-fold" />}
        </span>
      ))}
    </span>
  );
}
