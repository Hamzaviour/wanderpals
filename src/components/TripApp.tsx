"use client";

import { Check, Link2, Play, Plus, Square, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { computeBudget, formatUSD } from "@/lib/budget";
import { dayTravelMinutes, reflow, uid } from "@/lib/itinerary";
import { dayLine, introLine, outroLine } from "@/lib/narration";
import { clearLocal, decodeTrip, encodeTrip, loadLocal, saveLocal, type Votes } from "@/lib/share";
import { chime, setMuted } from "@/lib/sound";
import type { PlanStep, Itinerary, PlanEvent } from "@/lib/types";
import { PlanLog } from "./PlanLog";
import { BudgetMeter, budgetMood } from "./BudgetMeter";
import { DepartureBoard } from "./DepartureBoard";
import { FlapText } from "./FlapText";
import { GlobeMap, type GlobeHandle } from "./GlobeMap";
import { Hero } from "./Hero";
import { Logo } from "./Logo";
import { Pal, PALS, type Mood } from "./Pal";
import { PromptBar } from "./PromptBar";
import { VoteBoard } from "./VoteBoard";

type Phase = "idle" | "planning" | "trip";
type Toast = { id: number; text: string; mood: Mood };
type Fly = { caption: string; kicker: string; line: string } | null;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function pickVoice() {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  const en = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  return (
    en.find((v) => /samantha|aria|jenny|google us english|natural/i.test(v.name)) ??
    en.find((v) => v.localService) ??
    en[0]
  );
}

export function TripApp() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [prompt, setPrompt] = useState("");
  const [steps, setSteps] = useState<PlanStep[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [it, setIt] = useState<Itinerary | null>(null);
  const [undoStack, setUndoStack] = useState<Itinerary[]>([]);
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const [votes, setVotes] = useState<Votes>({});
  const [voter, setVoter] = useState("You");
  const [tab, setTab] = useState<"plan" | "vote">("plan");
  const [toast, setToast] = useState<Toast | null>(null);
  const [fly, setFly] = useState<Fly>(null);
  const [sound, setSound] = useState(false);
  const [voice, setVoice] = useState(true);
  const [copied, setCopied] = useState(false);
  const [delta, setDelta] = useState<number | null>(null);
  const [cheer, setCheer] = useState(false);
  const globe = useRef<GlobeHandle>(null);
  const flying = useRef(false);
  const channel = useRef<BroadcastChannel | null>(null);
  const prevTotal = useRef<number | null>(null);

  const budget = useMemo(() => (it ? computeBudget(it) : null), [it]);

  // ---- restore: shared link first, then the last trip on this device
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const code = hash.get("t");
      // arriving from the landing page with a sentence already typed
      const q = hash.get("q");
      if (q) {
        window.history.replaceState(null, "", window.location.pathname);
        if (!cancelled) void planRef.current(q);
        return;
      }
      const shared = code ? await decodeTrip(code) : null;
      const trip = shared ?? loadLocal();
      try {
        const name = localStorage.getItem("wanderpals:voter");
        if (name) setVoter(name);
      } catch {}
      if (cancelled || !trip) return;
      setIt(trip.itinerary);
      setVotes(trip.votes ?? {});
      setPhase("trip");
      if (shared) window.history.replaceState(null, "", window.location.pathname);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- persist + cross-tab vote sync
  useEffect(() => {
    if (it) saveLocal({ itinerary: it, votes });
  }, [it, votes]);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const ch = new BroadcastChannel("wanderpals");
    ch.onmessage = (e: MessageEvent<{ type: string; tripId: string; votes: Votes; itinerary?: Itinerary }>) => {
      if (e.data?.type === "votes") {
        setIt((cur) => {
          if (cur && cur.id === e.data.tripId) setVotes(e.data.votes);
          return cur;
        });
      }
    };
    channel.current = ch;
    return () => ch.close();
  }, []);

  // ---- budget delta bubble
  useEffect(() => {
    if (!budget) return;
    if (prevTotal.current != null && prevTotal.current !== budget.total) {
      setDelta(budget.total - prevTotal.current);
      const t = setTimeout(() => setDelta(null), 2600);
      prevTotal.current = budget.total;
      return () => clearTimeout(t);
    }
    prevTotal.current = budget.total;
  }, [budget]);

  const say = useCallback((text: string, mood: Mood = "happy") => {
    setToast({ id: Date.now(), text, mood });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(t);
  }, [toast]);

  // ---- planning
  const plan = useCallback(
    async (text: string) => {
      setPrompt(text);
      setSteps([]);
      setError(null);
      setPhase("planning");
      setTab("plan");
      setActiveDay(null);
      setActiveStopId(null);
      try {
        const res = await fetch("/api/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: text }),
        });
        if (!res.body) throw new Error("No response from the planner.");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        let result: Itinerary | null = null;
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          let nl: number;
          while ((nl = buf.indexOf("\n")) >= 0) {
            const line = buf.slice(0, nl).trim();
            buf = buf.slice(nl + 1);
            if (!line) continue;
            const ev = JSON.parse(line) as PlanEvent;
            if (ev.type === "step") {
              setSteps((s) => {
                const i = s.findIndex((x) => x.id === ev.step.id);
                if (i < 0) return [...s, ev.step];
                const next = [...s];
                next[i] = ev.step;
                return next;
              });
            } else if (ev.type === "error") {
              throw new Error(ev.message);
            } else if (ev.type === "itinerary") {
              result = ev.itinerary;
            }
          }
        }
        if (!result) throw new Error("The planner went quiet. Try again?");
        await wait(500);
        prevTotal.current = null;
        setIt(result);
        setUndoStack([]);
        setVotes({});
        setPhase("trip");
        chime();
        setTimeout(() => say(`${PALS[result!.pals[0]].name}: ${result!.title}! Scroll the board or tap a city to zoom in.`, "cheer"), 1400);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went sideways.");
      }
    },
    [say],
  );

  const planRef = useRef(plan);
  useEffect(() => {
    planRef.current = plan;
  });

  // ---- camera follows selection
  const focusDay = useCallback(
    (d: number, gentle = false) => {
      if (!it || flying.current) return;
      const day = it.days.find((x) => x.day === d);
      if (!day) return;
      setActiveDay(d);
      setActiveStopId(null);
      const pts = day.stops.length ? day.stops : [day];
      globe.current?.fitPoints(pts, { pitch: 48, bearing: (d % 4) * 12 - 18, duration: gentle ? 1700 : 2600, maxZoom: 14 });
    },
    [it],
  );

  const focusStop = useCallback(
    (id: string) => {
      if (!it) return;
      const day = it.days.find((d) => d.stops.some((s) => s.id === id));
      const stop = day?.stops.find((s) => s.id === id);
      if (!day || !stop) return;
      setActiveDay(day.day);
      setActiveStopId(id);
      globe.current?.flyTo({ lat: stop.lat, lng: stop.lng, zoom: 15.7, pitch: 62, bearing: -25, duration: 2400, curve: 1.4 });
    },
    [it],
  );

  // ---- edits (each one undoable)
  const commit = useCallback((next: Itinerary, prev: Itinerary) => {
    setUndoStack((h) => [...h.slice(-19), prev]);
    setIt(next);
  }, []);

  const moveStop = useCallback(
    async (id: string, lat: number, lng: number) => {
      if (!it) return;
      const day = it.days.find((d) => d.stops.some((s) => s.id === id));
      if (!day) return;
      const before = dayTravelMinutes(day, it.transit);
      const oldName = day.stops.find((s) => s.id === id)!.name;
      const moved = reflow({
        ...it,
        days: it.days.map((d) =>
          d.day !== day.day ? d : { ...d, stops: d.stops.map((s) => (s.id === id ? { ...s, lat, lng, name: "Finding a name…", moved: true } : s)) },
        ),
      });
      commit(moved, it);
      setActiveDay(day.day);
      setActiveStopId(id);
      let spot = { name: "Your secret spot", blurb: "A place you picked yourself.", kind: "sight" as const };
      try {
        const r = await fetch(`/api/place?lat=${lat}&lng=${lng}`);
        if (r.ok) spot = await r.json();
      } catch {}
      setIt((cur) => {
        if (!cur) return cur;
        const next = reflow({
          ...cur,
          days: cur.days.map((d) => ({
            ...d,
            stops: d.stops.map((s) => (s.id === id ? { ...s, name: spot.name, blurb: spot.blurb, kind: spot.kind ?? s.kind } : s)),
          })),
        });
        const after = dayTravelMinutes(next.days.find((d) => d.day === day.day)!, next.transit);
        const diff = after - before;
        say(
          `Moved ${oldName} to ${spot.name}. Day ${day.day} travel ${diff === 0 ? "stays the same" : `${diff > 0 ? "+" : "−"}${Math.abs(diff)} min`}, times re-planned.`,
          diff > 30 ? "sweat" : "happy",
        );
        return next;
      });
    },
    [it, commit, say],
  );

  const removeStop = useCallback(
    (id: string) => {
      if (!it) return;
      const day = it.days.find((d) => d.stops.some((s) => s.id === id));
      const stop = day?.stops.find((s) => s.id === id);
      if (!day || !stop) return;
      const { time: _time, ...rest } = stop;
      void _time;
      const next = reflow({
        ...it,
        days: it.days.map((d) => (d.day === day.day ? { ...d, stops: d.stops.filter((s) => s.id !== id) } : d)),
        ideas: [{ id: uid("i"), cityId: day.cityId, city: day.city, stop: rest }, ...it.ideas],
      });
      commit(next, it);
      if (activeStopId === id) setActiveStopId(null);
      say(`${stop.name} moved to the vote board. Saved ${stop.cost ? formatUSD(stop.cost * it.travelers) : "some time"}.`, "happy");
    },
    [it, commit, say, activeStopId],
  );

  const addIdea = useCallback(
    (ideaId: string) => {
      if (!it) return;
      const idea = it.ideas.find((i) => i.id === ideaId);
      if (!idea) return;
      const candidates = it.days.filter((d) => d.cityId === idea.cityId);
      const target = (candidates.length ? candidates : it.days).reduce((a, b) => (b.stops.length < a.stops.length ? b : a));
      const next = reflow({
        ...it,
        days: it.days.map((d) => (d.day === target.day ? { ...d, stops: [...d.stops, { ...idea.stop, time: "09:00" }] } : d)),
        ideas: it.ideas.filter((i) => i.id !== ideaId),
      });
      commit(next, it);
      const { [ideaId]: _gone, ...rest } = votes;
      void _gone;
      setVotes(rest);
      say(`${idea.stop.name} joins day ${target.day}!`, "cheer");
      focusDay(target.day);
    },
    [it, votes, commit, say, focusDay],
  );

  const vote = useCallback(
    (ideaId: string) => {
      if (!it) return;
      const name = voter.trim() || "You";
      setVotes((v) => {
        const who = v[ideaId] ?? [];
        const next = { ...v, [ideaId]: who.includes(name) ? who.filter((n) => n !== name) : [...who, name] };
        channel.current?.postMessage({ type: "votes", tripId: it.id, votes: next });
        return next;
      });
    },
    [it, voter],
  );

  const undo = useCallback(() => {
    setUndoStack((h) => {
      const prev = h.at(-1);
      if (prev) setIt(prev);
      return h.slice(0, -1);
    });
  }, []);

  const share = useCallback(async () => {
    if (!it) return;
    const code = await encodeTrip({ itinerary: it, votes });
    const url = `${window.location.origin}${window.location.pathname}#t=${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      say("Trip link copied. Friends can open it and vote.", "cheer");
    } catch {
      window.prompt("Copy your trip link:", url);
    }
  }, [it, votes, say]);

  const newTrip = useCallback(() => {
    flying.current = false;
    window.speechSynthesis?.cancel();
    setIt(null);
    setVotes({});
    setUndoStack([]);
    setFly(null);
    setPhase("idle");
    clearLocal();
  }, []);

  // ---- cinematic flyover
  const speak = useCallback(
    (text: string) => {
      const est = Math.max(2600, text.split(/\s+/).length * 360);
      if (!voice || typeof window === "undefined" || !window.speechSynthesis) return wait(est);
      return new Promise<void>((resolve) => {
        const u = new SpeechSynthesisUtterance(text);
        const v = pickVoice();
        if (v) u.voice = v;
        u.rate = 1.04;
        u.pitch = 1.12;
        const done = () => resolve();
        u.onend = done;
        u.onerror = done;
        setTimeout(done, est + 6000);
        window.speechSynthesis.speak(u);
      });
    },
    [voice],
  );

  const stopFlyover = useCallback(() => {
    flying.current = false;
    window.speechSynthesis?.cancel();
    setFly(null);
  }, []);

  const playFlyover = useCallback(async () => {
    if (!it || !globe.current || flying.current) return;
    const g = globe.current;
    flying.current = true;
    window.speechSynthesis?.cancel();
    setActiveStopId(null);
    setFly({ caption: it.destination.split(",")[0], kicker: "NOW DEPARTING", line: introLine(it) });
    const intro = speak(introLine(it));
    await g.flyTo({ lat: it.days[0].lat, lng: it.days[0].lng, zoom: 1.4, pitch: 0, bearing: 0, duration: 2600, curve: 1.2 });
    await intro;
    for (let i = 0; i < it.days.length && flying.current; i++) {
      const day = it.days[i];
      const prev = it.days[i - 1];
      setActiveDay(day.day);
      setActiveStopId(null);
      const line = dayLine(day, it);
      setFly({ caption: day.city, kicker: `DAY ${String(day.day).padStart(2, "0")}`, line });
      const talking = speak(line);
      if (prev && prev.cityId !== day.cityId) await g.travelTo(day, prev, 3400);
      else await g.travelTo(day, undefined, 0);
      if (!flying.current) break;
      await g.flyTo({ lat: day.lat, lng: day.lng, zoom: 12.3, pitch: 52, bearing: i * 30 - 20, duration: 2600, curve: 1.7 });
      for (let j = 0; j < day.stops.length && flying.current; j++) {
        const s = day.stops[j];
        setActiveStopId(s.id);
        setFly({ caption: day.city, kicker: `DAY ${String(day.day).padStart(2, "0")} · ${s.time}`, line: `${s.name}. ${s.blurb}` });
        await g.flyTo({ lat: s.lat, lng: s.lng, zoom: 15.9, pitch: 64, bearing: i * 30 + j * 45, duration: 2300, curve: 1.3 });
        if (!flying.current) break;
        await g.rotate(28, 1700);
      }
      await talking;
    }
    if (flying.current) {
      setActiveStopId(null);
      setActiveDay(null);
      setFly({ caption: "WELCOME HOME", kicker: "ARRIVED", line: outroLine(it) });
      setCheer(true);
      const outro = speak(outroLine(it));
      await globe.current?.overview(3000);
      await outro;
      setCheer(false);
    }
    flying.current = false;
    setFly(null);
  }, [it, speak]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && flying.current) stopFlyover();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stopFlyover]);

  const crewMood: Mood = cheer ? "cheer" : budget ? budgetMood(budget) : "happy";
  const showPanel = phase === "trip" && it && !fly;

  return (
    <main className="fixed inset-0 overflow-hidden">
      <GlobeMap
        ref={globe}
        itinerary={phase === "trip" ? it : null}
        activeDay={activeDay}
        activeStopId={activeStopId}
        crewMood={crewMood}
        onSelectDay={(d) => focusDay(d)}
        onSelectStop={focusStop}
        onStopMoved={moveStop}
      />

      {/* top bar (idle + planning) */}
      {phase !== "trip" && (
        <header className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-6">
          <Link href="/" className="pointer-events-auto" aria-label="Wanderpals home">
            <Logo size={40} />
          </Link>
          <nav className="pointer-events-auto flex items-center gap-2">
            <SoundButton on={sound} onToggle={() => { setMuted(sound); setSound(!sound); }} />
            <Link href="/brand" className="chip bg-white/85 py-2 text-ink ring-[3px] ring-ink transition hover:-translate-y-0.5 hover:bg-white">
              Meet the pals
            </Link>
          </nav>
        </header>
      )}

      {phase === "idle" && <Hero onPlan={plan} busy={false} />}
      {phase === "planning" && <PlanLog steps={steps} prompt={prompt} error={error} onRetry={() => setPhase(it ? "trip" : "idle")} />}

      {/* the departure board */}
      {showPanel && budget && (
        <>
          <aside className="rise-in absolute inset-x-0 bottom-0 z-10 flex h-[54dvh] flex-col sm:inset-x-auto sm:bottom-4 sm:left-4 sm:top-4 sm:h-auto sm:w-[430px]">
            <div className="board flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-none sm:rounded-b-[22px]">
              <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-3.5">
                <Link href="/" aria-label="Wanderpals home">
                  <Logo size={30} tone="light" />
                </Link>
                <div className="flex items-center gap-1.5">
                  <SoundButton on={sound} dark onToggle={() => { setMuted(sound); setSound(!sound); }} />
                  <button type="button" onClick={share} className="chip bg-ink-3 py-2 text-flap transition hover:bg-ink-soft" aria-label="Copy trip link">
                    {copied ? <Check className="size-4 text-mint" strokeWidth={3} /> : <Link2 className="size-4" strokeWidth={2.5} />}
                    <span className="hidden sm:inline">{copied ? "Copied" : "Share"}</span>
                  </button>
                  <button type="button" onClick={newTrip} className="chip bg-ink-3 py-2 text-flap transition hover:bg-ink-soft" aria-label="Start a new trip">
                    <Plus className="size-4" strokeWidth={3} />
                    <span className="hidden sm:inline">New</span>
                  </button>
                </div>
              </div>
              <div className="px-4 pb-3">
                <div className="board-rule mb-3 opacity-80" />
                <h2 className="font-display text-[26px] font-extrabold leading-[1.05] tracking-[-0.03em] text-flap sm:text-[30px]">{it.title}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="chip bg-ink-3 text-flap">{it.month}</span>
                  <span className="chip bg-ink-3 text-flap">
                    {it.travelers} traveler{it.travelers > 1 ? "s" : ""}
                  </span>
                  <span className="chip bg-ink-3 text-flap/80">{it.plannedBy === "ai-scout" ? "Scouted by AI" : "Wanderpals planner"}</span>
                  <span className="ml-auto flex -space-x-2">
                    {it.pals.map((p) => (
                      <Pal key={p} id={p} size={26} bob={false} />
                    ))}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 rounded-full bg-ink-2 p-1" role="tablist" aria-label="Trip views">
                  {(["plan", "vote"] as const).map((t) => (
                    <button
                      key={t}
                      role="tab"
                      aria-selected={tab === t}
                      onClick={() => setTab(t)}
                      className={`rounded-full py-1.5 font-display text-[14px] font-bold transition ${tab === t ? "bg-sun text-ink" : "text-flap/75 hover:text-flap"}`}
                    >
                      {t === "plan" ? "Itinerary" : `Friends vote · ${it.ideas.length}`}
                    </button>
                  ))}
                </div>
              </div>
              {tab === "plan" ? (
                <DepartureBoard
                  it={it}
                  activeDay={activeDay}
                  activeStopId={activeStopId}
                  onSelectDay={(d) => focusDay(d)}
                  onSelectStop={focusStop}
                  onRemoveStop={removeStop}
                  onScrollDay={(d) => d !== activeDay && focusDay(d, true)}
                  canUndo={undoStack.length > 0}
                  onUndo={undo}
                />
              ) : (
                <VoteBoard
                  it={it}
                  votes={votes}
                  voter={voter}
                  onVoter={(n) => {
                    setVoter(n);
                    try {
                      localStorage.setItem("wanderpals:voter", n);
                    } catch {}
                  }}
                  onVote={vote}
                  onAdd={addIdea}
                />
              )}
            </div>
          </aside>

          <div className="rise-in absolute right-3 top-3 z-10 w-[min(300px,calc(100vw-1.5rem))] sm:right-4 sm:top-4">
            <BudgetMeter budget={budget} pal={it.pals.includes("momo") ? "momo" : it.pals[0]} delta={delta} />
          </div>

          <div className="absolute bottom-[calc(54dvh+12px)] right-3 z-10 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
            <div className="hidden w-[min(440px,calc(100vw-500px))] sm:block">
              <PromptBar compact onSubmit={plan} busy={false} placeholder="Plan a different trip…" />
            </div>
            <button
              type="button"
              onClick={playFlyover}
              className="group flex items-center gap-3 rounded-full bg-coral py-2.5 pl-2.5 pr-5 font-display text-[17px] font-extrabold text-white shadow-[0_18px_30px_-12px_rgba(22,35,59,.6)] ring-[3px] ring-ink transition hover:-translate-y-1 hover:bg-[#ff5a43] active:translate-y-0 sm:text-lg"
            >
              <span className="grid size-10 place-items-center rounded-full bg-white text-coral ring-[3px] ring-ink transition group-hover:scale-110">
                <Play className="size-5 translate-x-px fill-current" strokeWidth={2.5} />
              </span>
              Play flyover
            </button>
          </div>
        </>
      )}

      {/* flyover overlay */}
      {fly && (
        <div className="pointer-events-none absolute inset-0 z-20">
          <div className="absolute inset-x-0 top-0 h-[9vh] origin-top animate-[letterbox_.8s_var(--ease-out)_both] bg-ink" />
          <div className="absolute inset-x-0 bottom-0 h-[9vh] origin-bottom animate-[letterbox_.8s_var(--ease-out)_both] bg-ink" />
          <div className="absolute inset-x-0 bottom-[11vh] flex flex-col items-center gap-3 px-4">
            <div className="board flex flex-col items-center gap-2 px-5 py-4 sm:px-7">
              <FlapText text={fly.kicker} size="sm" tone="sun" />
              <FlapText text={fly.caption} length={Math.min(14, Math.max(6, fly.caption.length))} size="lg" />
            </div>
            <p className="max-w-[60ch] rounded-2xl bg-ink/85 px-4 py-2.5 text-center font-display text-[15px] font-semibold leading-snug text-flap sm:text-base" aria-live="polite">
              {fly.line}
            </p>
          </div>
          <div className="pointer-events-auto absolute right-4 top-[calc(9vh+12px)] flex gap-2">
            <button
              type="button"
              onClick={() => {
                setVoice(!voice);
                if (voice) window.speechSynthesis?.cancel();
              }}
              className="chip bg-white py-2 text-ink ring-[3px] ring-ink"
              aria-pressed={voice}
            >
              {voice ? <Volume2 className="size-4" strokeWidth={2.5} /> : <VolumeX className="size-4" strokeWidth={2.5} />}
              Narration {voice ? "on" : "off"}
            </button>
            <button type="button" onClick={stopFlyover} className="chip bg-coral py-2 text-white ring-[3px] ring-ink">
              <Square className="size-3.5 fill-current" strokeWidth={2.5} /> Stop
            </button>
          </div>
        </div>
      )}

      {/* pal toast */}
      {toast && it && (
        <div key={toast.id} className="rise-in pointer-events-none absolute left-1/2 top-[86px] z-30 flex w-[min(460px,calc(100vw-2rem))] -translate-x-1/2 items-center gap-3 rounded-2xl bg-white px-3 py-2.5 shadow-[0_18px_30px_-14px_rgba(22,35,59,.55)] ring-[3px] ring-ink sm:top-6" role="status">
          <Pal id={it.pals[0]} size={40} mood={toast.mood} bob={false} />
          <p className="font-display text-[15px] font-bold leading-snug text-ink">{toast.text}</p>
        </div>
      )}
    </main>
  );
}

function SoundButton({ on, onToggle, dark = false }: { on: boolean; onToggle: () => void; dark?: boolean }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={on ? "Turn board sounds off" : "Turn board sounds on"}
      className={`chip py-2 transition ${dark ? "bg-ink-3 text-flap hover:bg-ink-soft" : "bg-white/85 text-ink ring-[3px] ring-ink hover:bg-white"}`}
    >
      {on ? <Volume2 className="size-4" strokeWidth={2.5} /> : <VolumeX className="size-4" strokeWidth={2.5} />}
    </button>
  );
}
