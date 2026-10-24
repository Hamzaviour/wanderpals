"use client";

import { BookOpen, Calculator, CloudSun, Heart, MapPinned, MessageSquareText, Route, Sparkles, TramFront } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BudgetMeter } from "../BudgetMeter";
import { FlapText } from "../FlapText";
import { KIND_COLOR } from "../GlobeMap";
import { Pal } from "../Pal";
import { PromptBar } from "../PromptBar";
import type { Budget, StopKind } from "@/lib/types";

export function LandingPrompt({ placeholder }: { placeholder?: string }) {
  const router = useRouter();
  return <PromptBar placeholder={placeholder} busy={false} onSubmit={(t) => router.push(`/plan#q=${encodeURIComponent(t)}`)} />;
}

function useTicker(ms: number) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setN((x) => x + 1), ms);
    return () => clearInterval(t);
  }, [ms]);
  return n;
}

/* ---------- Day 1: say it ---------- */
const SENTENCES = [
  "10 days in Japan in April, I love food and hiking, $2000",
  "A week in Italy for art, pasta and coastal walks, $2500",
  "6 day road trip in Iceland, waterfalls and hot springs",
  "Long weekend in Lisbon with my partner, fado and pastries",
];

export function TypeDemo() {
  const [i, setI] = useState(0);
  const [len, setLen] = useState(0);
  useEffect(() => {
    const full = SENTENCES[i % SENTENCES.length];
    const t = setTimeout(
      () => {
        if (len < full.length) setLen(len + 1);
        else {
          setLen(0);
          setI(i + 1);
        }
      },
      len < full.length ? 38 : 2200,
    );
    return () => clearTimeout(t);
  }, [i, len]);
  const text = SENTENCES[i % SENTENCES.length].slice(0, len);
  return (
    <div className="flex items-center gap-3 rounded-full bg-white p-2 pl-5 ring-[3px] ring-ink">
      <p className="min-w-0 flex-1 truncate font-display text-[16px] font-semibold text-ink sm:text-[18px]" aria-label={SENTENCES[i % SENTENCES.length]}>
        {text}
        <span className="ml-0.5 inline-block h-5 w-[3px] translate-y-1 animate-pulse bg-coral" />
      </p>
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-coral text-white ring-[3px] ring-ink" aria-hidden>
        <Sparkles className="size-5" strokeWidth={2.5} />
      </span>
    </div>
  );
}

/* ---------- Day 2: watch it plan ---------- */
const STEPS = [
  { icon: MessageSquareText, label: "Reading your wish", detail: "10 days · April · $2,000 · food, hike" },
  { icon: MapPinned, label: "Scouting places in Japan", detail: "Tokyo ×3 → Hakone ×2 → Kyoto ×3 → Osaka ×2" },
  { icon: Route, label: "Routing between stops", detail: "3 city hops, 30 stops" },
  { icon: CloudSun, label: "Checking April weather", detail: "Typically 11–19°C" },
  { icon: Calculator, label: "Balancing the budget", detail: "$1,843 of $2,000" },
];

export function PlanDemo() {
  const tick = useTicker(950);
  const done = tick % (STEPS.length + 3);
  return (
    <ol className="flex flex-col gap-1.5" aria-label="Example planner steps">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const state = i < done ? "done" : i === done ? "run" : "wait";
        return (
          <li
            key={s.label}
            className={`grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-xl px-3 py-2 transition duration-500 ${state === "wait" ? "bg-ink-2/40 opacity-45" : "bg-ink-2"}`}
          >
            <span className="grid size-8 place-items-center rounded-lg bg-ink-3 text-sun">
              <Icon className="size-4" strokeWidth={2.5} />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-[15px] font-bold text-flap">{s.label}</span>
              <span className="block truncate text-[13px] text-flap/60">{state === "wait" ? "…" : s.detail}</span>
            </span>
            <FlapText text={state === "done" ? "DONE" : state === "run" ? "CHECK" : "WAIT"} length={5} size="xs" tone={state === "done" ? "mint" : "sun"} />
          </li>
        );
      })}
    </ol>
  );
}

/* ---------- Day 3: drag to replan ---------- */
export function DragDemo() {
  const tick = useTicker(2600);
  const moved = tick % 2 === 1;
  return (
    <div className="grid gap-3 sm:grid-cols-[1.1fr_1fr]">
      <svg viewBox="0 0 320 220" className="w-full rounded-2xl bg-[#F6F1DE] ring-[3px] ring-ink" role="img" aria-label="A map where a pin is dragged to a new place">
        <path d="M-10 160 C60 130 90 190 170 150 S280 120 330 140 L330 230 L-10 230Z" fill="#6CCBF2" />
        <path d="M30 0 V220 M110 0 V220 M200 0 V220 M270 0 V220 M0 40 H320 M0 100 H320" stroke="#FFFFFF" strokeWidth="6" />
        <rect x="120" y="50" width="60" height="38" rx="8" fill="#BFEAA2" />
        <path d={moved ? "M60 70 L250 64 L150 128" : "M60 70 L160 120 L150 128"} fill="none" stroke="#FF6B57" strokeWidth="3" strokeDasharray="6 6" />
        {[
          { x: 60, y: 70, n: 1, c: KIND_COLOR.culture },
          { x: moved ? 250 : 160, y: moved ? 64 : 120, n: 2, c: moved ? KIND_COLOR.night : KIND_COLOR.food },
          { x: 150, y: 128, n: 3, c: KIND_COLOR.sight },
        ].map((p) => (
          <g key={p.n} style={{ transform: `translate(${p.x}px, ${p.y}px)`, transition: "transform .9s cubic-bezier(.16,1,.3,1)" }}>
            <path d="M0 0 C-12 -14 -12 -30 0 -30 C12 -30 12 -14 0 0Z" fill={p.c} stroke="#16233B" strokeWidth="3" />
            <text y="-14" textAnchor="middle" fontFamily="var(--font-shoulders)" fontWeight="800" fontSize="13" fill="#16233B">
              {p.n}
            </text>
          </g>
        ))}
      </svg>
      <div className="flex flex-col gap-1.5 rounded-2xl bg-ink p-3 text-flap">
        <Row time="09:00" n={1} kind="culture" name="Senso-ji Temple" />
        <p className="flex items-center gap-1.5 pl-12 text-[12px] font-semibold text-flap/55">
          <TramFront className="size-3.5" strokeWidth={2.5} /> {moved ? "34 min metro" : "22 min metro"}
          {moved && <span className="rise-in rounded-full bg-coral px-1.5 font-flap text-[12px] font-extrabold text-white">+12 MIN</span>}
        </p>
        <Row time={moved ? "11:45" : "11:30"} n={2} kind={moved ? "night" : "food"} name={moved ? "Golden Gai" : "Tsukiji Outer Market"} pick={moved} />
        <Row time={moved ? "14:10" : "13:30"} n={3} kind="sight" name="teamLab Planets" />
      </div>
    </div>
  );
}

function Row({ time, n, kind, name, pick }: { time: string; n: number; kind: StopKind; name: string; pick?: boolean }) {
  return (
    <div className="grid grid-cols-[2.6rem_1.5rem_1fr] items-center gap-2 rounded-lg px-1 py-1">
      <span className="font-flap text-[15px] font-extrabold">{time}</span>
      <span className="grid size-6 place-items-center rounded-full font-flap text-[13px] font-extrabold text-ink ring-2 ring-ink" style={{ background: KIND_COLOR[kind] }}>
        {n}
      </span>
      <span className="truncate font-display text-[14px] font-bold">
        {name}
        {pick && <span className="ml-1.5 rounded bg-pink/20 px-1 text-[10px] text-pink">YOUR PICK</span>}
      </span>
    </div>
  );
}

/* ---------- Day 4: the budget meter ---------- */
const EXTRAS = [
  { id: "gondola", name: "Gondola ride", cost: 90, kind: "activities" as const },
  { id: "uffizi", name: "Uffizi Gallery", cost: 27, kind: "activities" as const },
  { id: "bistecca", name: "Bistecca dinner", cost: 70, kind: "food" as const },
  { id: "hotel", name: "Upgrade to a canal-view hotel", cost: 260, kind: "lodging" as const },
];

export function BudgetDemo() {
  const [on, setOn] = useState<Record<string, boolean>>({ uffizi: true, bistecca: true });
  const [delta, setDelta] = useState<number | null>(null);
  const budget = useMemo<Budget>(() => {
    const b = { lodging: 780, food: 300, activities: 150, transit: 170, total: 0, limit: 1600 };
    EXTRAS.forEach((x) => {
      if (on[x.id]) b[x.kind] += x.cost;
    });
    b.total = b.lodging + b.food + b.activities + b.transit;
    return b;
  }, [on]);
  return (
    <div className="grid items-start gap-3 sm:grid-cols-[1fr_auto]">
      <ul className="flex flex-col gap-1.5">
        {EXTRAS.map((x) => (
          <li key={x.id}>
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5 ring-[3px] ring-ink transition hover:-translate-y-0.5">
              <span className="font-display text-[15px] font-bold text-ink">{x.name}</span>
              <span className="flex items-center gap-3">
                <span className="font-flap text-[16px] font-extrabold text-ink">${x.cost}</span>
                <input
                  type="checkbox"
                  checked={!!on[x.id]}
                  onChange={(e) => {
                    setOn((o) => ({ ...o, [x.id]: e.target.checked }));
                    setDelta(e.target.checked ? x.cost : -x.cost);
                  }}
                  className="peer sr-only"
                />
                <span className="relative h-7 w-12 rounded-full bg-ink-soft/30 ring-2 ring-ink transition after:absolute after:left-1 after:top-1 after:size-5 after:rounded-full after:bg-white after:ring-2 after:ring-ink after:transition peer-checked:bg-mint peer-checked:after:translate-x-5 peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-sun" />
              </span>
            </label>
          </li>
        ))}
        <li className="px-1 pt-1 text-[13px] font-semibold text-ink/65">Flip a few on. Watch Momo.</li>
      </ul>
      <BudgetMeter budget={budget} pal="momo" delta={delta} />
    </div>
  );
}

/* ---------- Day 5: the flyover ---------- */
const FRAMES = [
  { kicker: "DAY 01", city: "TOKYO", line: "We start at Senso-ji. Momo can't wait for Tsukiji." },
  { kicker: "DAY 04", city: "HAKONE", line: "50 minutes of a train ride from Tokyo. Onsen tonight." },
  { kicker: "DAY 06", city: "KYOTO", line: "Ten thousand orange gates up a mountain. Go early." },
  { kicker: "DAY 09", city: "OSAKA", line: "Takoyaki, neon and the running man sign." },
];

export function FlyDemo() {
  const tick = useTicker(3200);
  const f = FRAMES[tick % FRAMES.length];
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-gradient-to-b from-[#5DB8FF] to-[#DDF2FF] ring-[3px] ring-ink">
      <svg viewBox="0 0 400 250" className="absolute inset-0 h-full w-full" aria-hidden>
        <circle cx="200" cy="300" r="190" fill="#6CCBF2" stroke="#16233B" strokeWidth="3" />
        <path d="M60 210 C110 170 150 190 190 160 C230 135 270 170 330 150 L360 240 L40 240Z" fill="#BFEAA2" stroke="#16233B" strokeWidth="3" />
        <path d="M70 200 Q200 40 330 160" fill="none" stroke="#16233B" strokeWidth="7" strokeLinecap="round" />
        <path d="M70 200 Q200 40 330 160" fill="none" stroke="#FFC93C" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="10 8" className="animate-[dash_2s_linear_infinite]" />
      </svg>
      <div className="absolute left-1/2 top-[22%] -translate-x-1/2 animate-[float_3.2s_ease-in-out_infinite]">
        <div className="flex -space-x-2">
          <Pal id="lux" size={44} />
          <Pal id="momo" size={38} />
          <Pal id="pip" size={38} />
        </div>
      </div>
      <div className="absolute inset-x-0 top-0 h-[11%] bg-ink" />
      <div className="absolute inset-x-0 bottom-0 h-[11%] bg-ink" />
      <div className="absolute inset-x-0 bottom-[14%] flex flex-col items-center gap-2 px-3">
        <div className="board flex flex-col items-center gap-1 px-4 py-2.5">
          <FlapText text={f.kicker} size="xs" tone="sun" />
          <FlapText text={f.city} length={6} size="md" />
        </div>
        <p className="max-w-[40ch] rounded-xl bg-ink/85 px-3 py-1.5 text-center text-[13px] font-semibold text-flap">{f.line}</p>
      </div>
    </div>
  );
}

/* ---------- Day 6: vote with friends ---------- */
export function VoteDemo() {
  const [votes, setVotes] = useState<Record<string, string[]>>({
    burano: ["Sam", "Ari"],
    gondola: ["Ari"],
    fiesole: [],
  });
  const items = [
    { id: "burano", name: "Burano", blurb: "Rainbow island of lace makers.", kind: "sight" as const },
    { id: "gondola", name: "Gondola Ride", blurb: "Pricey, cheesy, completely worth it once.", kind: "sight" as const },
    { id: "fiesole", name: "Fiesole Walk", blurb: "Hill town with Roman ruins and olive groves.", kind: "hike" as const },
  ];
  const colors: Record<string, string> = { Sam: "#2FD4A3", Ari: "#8C6CFF", You: "#FF9F2E" };
  return (
    <ul className="flex flex-col gap-1.5">
      {[...items]
        .sort((a, b) => votes[b.id].length - votes[a.id].length)
        .map((it) => {
          const mine = votes[it.id].includes("You");
          return (
            <li key={it.id} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl bg-ink-2 p-2.5 transition-all">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-display text-[15px] font-bold text-flap">
                  <span className="size-2.5 rounded-full ring-2 ring-ink" style={{ background: KIND_COLOR[it.kind] }} />
                  {it.name}
                </p>
                <p className="truncate text-[13px] text-flap/60">{it.blurb}</p>
                <span className="mt-1 flex -space-x-1.5">
                  {votes[it.id].map((n) => (
                    <span key={n} className="grid size-5 place-items-center rounded-full font-flap text-[11px] font-extrabold text-ink ring-2 ring-ink" style={{ background: colors[n] }}>
                      {n[0]}
                    </span>
                  ))}
                </span>
              </div>
              <button
                type="button"
                aria-pressed={mine}
                onClick={() => setVotes((v) => ({ ...v, [it.id]: mine ? v[it.id].filter((n) => n !== "You") : [...v[it.id], "You"] }))}
                className={`chip py-2 transition ${mine ? "bg-coral text-white" : "bg-ink-3 text-flap hover:bg-ink-soft"}`}
              >
                <Heart className={`size-3.5 ${mine ? "fill-current" : ""}`} strokeWidth={2.5} /> {votes[it.id].length}
              </button>
            </li>
          );
        })}
      <li className="flex items-center gap-2 px-1 pt-1 text-[13px] font-semibold text-flap/60">
        <BookOpen className="size-3.5" strokeWidth={2.5} /> Tap a heart. The most-loved idea floats up.
      </li>
    </ul>
  );
}
