"use client";

import { SUGGESTED_TRIPS } from "@/lib/data/destinations";
import type { PalId } from "@/lib/types";
import { FlapText } from "./FlapText";
import { Pal } from "./Pal";
import { PromptBar } from "./PromptBar";

const CREW: { id: PalId; size: number; wave?: boolean }[] = [
  { id: "momo", size: 58 },
  { id: "pip", size: 66 },
  { id: "lux", size: 74, wave: true },
  { id: "dot", size: 62 },
  { id: "zuzu", size: 56 },
];

export function Hero({ onPlan, busy }: { onPlan: (text: string) => void; busy: boolean }) {
  return (
    <section className="pointer-events-none absolute inset-0 flex items-end justify-center overflow-y-auto px-4 pb-6 pt-[150px] sm:items-center sm:pb-8 sm:pt-28 lg:justify-start lg:pl-[max(2rem,5vw)]">
      <div className="pointer-events-auto relative w-full max-w-[680px] rise-in">
        {/* the crew stands on top of the board */}
        <div className="absolute -top-[66px] left-1/2 flex -translate-x-1/2 items-end gap-1 sm:-top-[78px] sm:gap-2">
          {CREW.map((c, i) => (
            <div key={c.id} style={{ animationDelay: `${i * 0.18}s` }} className="[&_.pal-bob]:[animation-delay:inherit]">
              <Pal id={c.id} size={c.size} wave={c.wave} />
            </div>
          ))}
        </div>

        <div className="board board-cq relative px-5 pb-5 pt-6 sm:px-8 sm:pb-7 sm:pt-8">
          <div className="board-rule mb-5 opacity-90" />
          <h1 className="flex flex-col items-start gap-1.5 sm:gap-2">
            <FlapText text="WHERE TO NEXT" size="xl" />
            <FlapText text="PAL?" size="xl" tone="sun" delay={500} />
          </h1>
          <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-flap/80 sm:text-base">
            Tell us your trip in one sentence. We plan every day, pin it on the globe, and fly you through it with the crew.
          </p>
          <div className="mt-5">
            <PromptBar onSubmit={onPlan} busy={busy} />
          </div>

          <div className="mt-6">
            <div className="mb-2 grid grid-cols-[3.2rem_1fr_auto] items-center gap-3 px-2 font-flap text-[13px] font-extrabold tracking-[0.14em] text-sun sm:grid-cols-[3.6rem_1fr_3rem_auto]">
              <span>FLIGHT</span>
              <span>DESTINATION</span>
              <span className="hidden sm:block">TRIP</span>
              <span className="text-right">STATUS</span>
            </div>
            <ul className="flex flex-col gap-1.5">
              {SUGGESTED_TRIPS.map((t, i) => (
                <li key={t.code} className={i >= 3 ? "[@media(max-height:820px)]:hidden" : ""}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onPlan(t.label)}
                    title={t.label}
                    className="group grid w-full grid-cols-[3.2rem_1fr_auto] items-center gap-3 rounded-xl px-2 py-1.5 text-left transition hover:bg-ink-2 disabled:opacity-50 sm:grid-cols-[3.6rem_1fr_3rem_auto]"
                  >
                    <FlapText text={t.code} size="sm" tone="sun" delay={300 + i * 120} />
                    <span className="min-w-0 overflow-hidden">
                      <FlapText text={t.dest} length={11} size="sm" delay={400 + i * 120} />
                    </span>
                    <span className="hidden sm:block">
                      <FlapText text={t.time} length={3} size="sm" delay={500 + i * 120} />
                    </span>
                    <span className="chip bg-mint/15 font-flap text-[13px] tracking-[0.12em] text-mint transition group-hover:bg-coral group-hover:text-white">
                      <span className="group-hover:hidden">ON TIME</span>
                      <span className="hidden group-hover:inline">BOARD</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-3 text-center text-[13px] font-semibold text-ink/70">
          Free to use. No account. Prices are friendly estimates, not quotes.
        </p>
      </div>
    </section>
  );
}
