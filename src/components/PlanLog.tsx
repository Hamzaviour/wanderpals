"use client";

import { BookOpen, Calculator, CloudSun, MapPinned, MessageSquareText, Route, Sparkles, Wand2 } from "lucide-react";
import type { PlanStep } from "@/lib/types";
import { FlapText } from "./FlapText";
import { Pal } from "./Pal";

const TOOL_ICON = {
  parse: MessageSquareText,
  places: MapPinned,
  route: Route,
  weather: CloudSun,
  wiki: BookOpen,
  budget: Calculator,
  compose: Wand2,
  ai: Sparkles,
} as const;

export function PlanLog({ steps, prompt, error, onRetry }: { steps: PlanStep[]; prompt: string; error: string | null; onRetry: () => void }) {
  return (
    <section className="pointer-events-none absolute inset-0 flex items-end justify-center px-4 pb-6 pt-24 sm:items-center">
      <div className="pointer-events-auto relative w-full max-w-[600px] rise-in" aria-live="polite">
        <div className="absolute -top-[60px] left-6 flex items-end gap-1">
          <Pal id="lux" size={58} mood={error ? "sweat" : "wow"} />
          <Pal id="momo" size={48} mood={error ? "sweat" : "happy"} />
        </div>
        <div className="board px-5 pb-5 pt-6 sm:px-7">
          <div className="board-rule mb-4" />
          <div className="flex items-center justify-between gap-3">
            <FlapText text={error ? "DELAYED" : "NOW PLANNING"} size="lg" tone={error ? "coral" : "sun"} />
          </div>
          <p className="mt-3 line-clamp-2 font-display text-[15px] font-semibold text-flap/85">&ldquo;{prompt}&rdquo;</p>
          <ol className="mt-4 flex flex-col gap-2">
            {steps.map((s) => {
              const Icon = TOOL_ICON[s.tool];
              return (
                <li key={s.id} className="rise-in grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-xl bg-ink-2 px-3 py-2.5">
                  <span className="grid size-8 place-items-center rounded-lg bg-ink-3 text-sun">
                    <Icon className="size-4" strokeWidth={2.5} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-[15px] font-bold text-flap">{s.label}</span>
                    {s.detail && <span className="block truncate text-[13px] text-flap/65">{s.detail}</span>}
                  </span>
                  <FlapText text={s.status === "done" ? "DONE" : "CHECK"} length={5} size="xs" tone={s.status === "done" ? "mint" : "sun"} />
                </li>
              );
            })}
          </ol>
          {error && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-coral/15 px-4 py-3">
              <p className="font-semibold text-[#FFB3A8]">{error}</p>
              <button type="button" onClick={onRetry} className="chip bg-coral py-2 text-white ring-2 ring-ink">
                Try another trip
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
