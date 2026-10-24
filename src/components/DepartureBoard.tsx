"use client";

import { Bus, Car, CloudSun, Footprints, Plane, Ship, TrainFront, TramFront, Undo2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { formatUSD } from "@/lib/budget";
import { formatMinutes } from "@/lib/geo";
import { legBetween } from "@/lib/itinerary";
import type { Day, Itinerary, TransitMode } from "@/lib/types";
import { FlapText } from "./FlapText";
import { KIND_COLOR } from "./GlobeMap";

export const MODE_ICON: Record<TransitMode, typeof Bus> = {
  walk: Footprints,
  metro: TramFront,
  train: TrainFront,
  bus: Bus,
  car: Car,
  ferry: Ship,
  flight: Plane,
};

const MODE_LABEL: Record<TransitMode, string> = {
  walk: "Walk",
  metro: "Metro",
  train: "Train",
  bus: "Bus",
  car: "Drive",
  ferry: "Ferry",
  flight: "Flight",
};

function DayCard({
  day,
  it,
  active,
  activeStopId,
  onSelectDay,
  onSelectStop,
  onRemoveStop,
}: {
  day: Day;
  it: Itinerary;
  active: boolean;
  activeStopId: string | null;
  onSelectDay: (d: number) => void;
  onSelectStop: (id: string) => void;
  onRemoveStop: (id: string) => void;
}) {
  const ArrivalIcon = day.arrival ? MODE_ICON[day.arrival.mode] : null;
  return (
    <section
      data-day={day.day}
      className={`scroll-mt-3 rounded-2xl p-3 transition-colors duration-300 sm:p-3.5 ${active ? "bg-ink-2 ring-2 ring-sun/70" : "bg-ink-2/45 hover:bg-ink-2/80"}`}
      aria-label={`Day ${day.day}, ${day.city}`}
    >
      <button type="button" className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-2.5 text-left" onClick={() => onSelectDay(day.day)}>
        <FlapText text={String(day.day).padStart(2, "0")} size="md" tone="sun" />
        <span className="min-w-0 overflow-hidden">
          <FlapText text={day.city} length={12} size="md" />
        </span>
        {day.weather && (
          <span className="chip bg-ink-3 text-flap" title={`Typical ${it.month} weather, from last year's observations`}>
            <CloudSun className="size-3.5 text-sun" strokeWidth={2.5} />
            {day.weather.hi}°
          </span>
        )}
      </button>
      <p className="mt-2 pl-0.5 font-display text-[15px] font-bold text-flap/90">{day.title}</p>

      {day.arrival && ArrivalIcon && (
        <p className="mt-2 flex items-center gap-2 rounded-lg bg-sun/12 px-2.5 py-1.5 text-[13px] font-semibold text-sun">
          <ArrivalIcon className="size-4 shrink-0" strokeWidth={2.5} />
          <span>
            {MODE_LABEL[day.arrival.mode]} from {day.arrival.from} · {formatMinutes(day.arrival.minutes)} · {Math.round(day.arrival.km)} km · {formatUSD(day.arrival.cost)}
          </span>
        </p>
      )}

      <ol className="mt-2 flex flex-col">
        {day.stops.map((s, i) => {
          const leg = i > 0 ? legBetween(day.stops[i - 1], s, it.transit) : null;
          const LegIcon = leg ? MODE_ICON[leg.mode] : null;
          return (
            <li key={s.id}>
              {leg && LegIcon && (
                <p className="flex items-center gap-1.5 py-1 pl-[3.35rem] text-[12px] font-semibold text-flap/50">
                  <LegIcon className="size-3.5" strokeWidth={2.5} />
                  {formatMinutes(leg.minutes)} {MODE_LABEL[leg.mode].toLowerCase()}
                </p>
              )}
              <div
                className={`group grid grid-cols-[2.6rem_1.6rem_1fr_auto] items-start gap-2 rounded-xl px-1.5 py-1.5 transition ${s.id === activeStopId ? "bg-ink-3" : "hover:bg-ink-3/60"}`}
              >
                <span className="pt-0.5 font-flap text-[15px] font-extrabold tabular-nums text-flap/80">{s.time}</span>
                <span
                  className="mt-0.5 grid size-6 place-items-center rounded-full font-flap text-[13px] font-extrabold text-ink ring-2 ring-ink"
                  style={{ background: KIND_COLOR[s.kind] }}
                >
                  {i + 1}
                </span>
                <button type="button" onClick={() => onSelectStop(s.id)} className="min-w-0 text-left">
                  <span className="block font-display text-[15px] font-bold leading-snug text-flap">
                    {s.name}
                    {s.moved && <span className="ml-1.5 rounded bg-pink/20 px-1.5 py-0.5 align-middle text-[11px] font-bold text-pink">YOUR PICK</span>}
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-flap/65">{s.blurb}</span>
                </button>
                <span className="flex items-center gap-1">
                  <span className="pt-0.5 text-[13px] font-bold tabular-nums text-flap/80">{s.cost ? formatUSD(s.cost) : "Free"}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveStop(s.id)}
                    aria-label={`Move ${s.name} to the vote board`}
                    title="Move to the vote board"
                    className="grid size-6 place-items-center rounded-md text-flap/40 opacity-100 transition hover:bg-coral hover:text-white sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
                  >
                    <X className="size-3.5" strokeWidth={3} />
                  </button>
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function DepartureBoard({
  it,
  activeDay,
  activeStopId,
  onSelectDay,
  onSelectStop,
  onRemoveStop,
  onScrollDay,
  canUndo,
  onUndo,
}: {
  it: Itinerary;
  activeDay: number | null;
  activeStopId: string | null;
  onSelectDay: (d: number) => void;
  onSelectStop: (id: string) => void;
  onRemoveStop: (id: string) => void;
  onScrollDay: (d: number) => void;
  canUndo: boolean;
  onUndo: () => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const quietUntil = useRef(0);
  const onScrollDayRef = useRef(onScrollDay);
  useEffect(() => {
    onScrollDayRef.current = onScrollDay;
  });

  // Scrolling the board drives the camera: once scrolling settles, the day
  // whose card sits at the top of the board takes the stage.
  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    // let the opening overview play before scrolling takes the camera
    quietUntil.current = Date.now() + 3500;
    let timer: ReturnType<typeof setTimeout>;
    const settle = () => {
      if (Date.now() < quietUntil.current) return;
      const line = root.getBoundingClientRect().top + 48;
      const cards = [...root.querySelectorAll<HTMLElement>("section[data-day]")];
      const hit = cards.find((el) => el.getBoundingClientRect().bottom > line);
      if (hit) onScrollDayRef.current(Number(hit.dataset.day));
    };
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(settle, 160);
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      root.removeEventListener("scroll", onScroll);
    };
  }, [it.id]);

  // ...and choosing a day elsewhere scrolls the board to it.
  useEffect(() => {
    const root = scroller.current;
    if (!root || activeDay == null) return;
    const el = root.querySelector<HTMLElement>(`section[data-day="${activeDay}"]`);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const rr = root.getBoundingClientRect();
    if (r.top < rr.top || r.top > rr.top + rr.height * 0.4) {
      quietUntil.current = Date.now() + 1200;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeDay]);

  return (
    <div ref={scroller} className="scroll-quiet flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-3 pb-4 sm:px-4">
      {it.notes.length > 0 && (
        <div className="rounded-2xl bg-sun/15 px-3.5 py-2.5 text-[13px] font-semibold text-sun">
          {it.notes.map((n) => (
            <p key={n}>{n}</p>
          ))}
        </div>
      )}
      {canUndo && (
        <button type="button" onClick={onUndo} className="chip self-start bg-ink-3 py-1.5 text-flap hover:bg-ink-soft">
          <Undo2 className="size-3.5" strokeWidth={2.5} /> Undo last change
        </button>
      )}
      {it.days.map((d) => (
        <DayCard
          key={d.day}
          day={d}
          it={it}
          active={d.day === activeDay}
          activeStopId={activeStopId}
          onSelectDay={onSelectDay}
          onSelectStop={onSelectStop}
          onRemoveStop={onRemoveStop}
        />
      ))}
      <p className="px-1 pt-1 text-[12px] leading-relaxed text-flap/50">
        Times and prices are estimates. Weather is typical for {it.month}, from last year&apos;s Open-Meteo observations. Map data © OpenStreetMap contributors.
      </p>
    </div>
  );
}
