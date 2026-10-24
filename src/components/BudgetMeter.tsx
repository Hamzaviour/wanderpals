"use client";

import { formatUSD } from "@/lib/budget";
import type { Budget, PalId } from "@/lib/types";
import { FlapText } from "./FlapText";
import { Pal, type Mood } from "./Pal";

const SEGMENTS = [
  { key: "lodging", label: "Stays", color: "var(--blue)" },
  { key: "food", label: "Food", color: "var(--tangerine)" },
  { key: "activities", label: "Fun", color: "var(--grape)" },
  { key: "transit", label: "Getting around", color: "var(--mint)" },
] as const;

export function budgetMood(b: Budget): Mood {
  const r = b.total / Math.max(1, b.limit);
  if (r > 1) return "sweat";
  if (r > 0.92) return "wow";
  return "happy";
}

export function BudgetMeter({ budget, pal, delta }: { budget: Budget; pal: PalId; delta: number | null }) {
  const scale = Math.max(budget.total, budget.limit);
  const over = budget.total - budget.limit;
  const mood = budgetMood(budget);
  return (
    <div className="board w-full p-3.5 sm:w-[300px] sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-flap text-[13px] font-extrabold tracking-[0.14em] text-sun">BUDGET · EST.</p>
          <div className="mt-1.5 flex items-baseline gap-2">
            <FlapText text={formatUSD(budget.total)} length={7} size="lg" tone={over > 0 ? "coral" : "flap"} className="max-sm:!text-[22px]" />
          </div>
          <p className="mt-1 text-[13px] font-semibold text-flap/70">
            of {formatUSD(budget.limit)}
            {over > 0 ? (
              <span className="ml-1.5 text-[#FFB3A8]">· {formatUSD(over)} over</span>
            ) : (
              <span className="ml-1.5 text-mint">· {formatUSD(-over)} spare</span>
            )}
          </p>
        </div>
        <div className="relative -mt-1">
          <Pal id={pal} size={50} mood={mood} className="max-sm:!w-10 max-sm:!h-12" />
          {delta != null && delta !== 0 && (
            <span
              key={delta + ":" + budget.total}
              className={`rise-in absolute -left-10 top-0 rounded-full px-2 py-0.5 font-flap text-[13px] font-extrabold ${delta > 0 ? "bg-coral text-white" : "bg-mint text-ink"}`}
            >
              {delta > 0 ? "+" : "−"}
              {formatUSD(Math.abs(delta))}
            </span>
          )}
        </div>
      </div>
      <div className="relative mt-2.5 h-3 sm:mt-3 sm:h-3.5 overflow-hidden rounded-full bg-ink-3" role="img" aria-label={`Budget used: ${formatUSD(budget.total)} of ${formatUSD(budget.limit)}`}>
        <div className="flex h-full">
          {SEGMENTS.map((s) => (
            <div
              key={s.key}
              className="h-full transition-[width] duration-700 ease-[cubic-bezier(.16,1,.3,1)]"
              style={{ width: `${(budget[s.key] / scale) * 100}%`, background: s.color }}
            />
          ))}
        </div>
        <div className="absolute inset-y-0 w-[3px] bg-flap" style={{ left: `calc(${(budget.limit / scale) * 100}% - 1.5px)` }} />
      </div>
      <ul className="mt-2.5 hidden grid-cols-2 gap-x-3 gap-y-1 sm:grid">
        {SEGMENTS.map((s) => (
          <li key={s.key} className="flex items-center justify-between gap-2 text-[12px] font-semibold text-flap/75">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
            <span className="tabular-nums text-flap">{formatUSD(budget[s.key])}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
