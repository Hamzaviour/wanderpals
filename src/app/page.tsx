import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FlapText } from "@/components/FlapText";
import { BudgetDemo, DragDemo, FlyDemo, LandingPrompt, PlanDemo, TypeDemo, VoteDemo } from "@/components/landing/Demos";
import { HeroGlobe, RouteRail } from "@/components/landing/Scenes";
import { Logo } from "@/components/Logo";
import { Pal, PALS } from "@/components/Pal";
import { SUGGESTED_TRIPS } from "@/lib/data/destinations";
import type { PalId } from "@/lib/types";

const TABS = [
  "best ramen kyoto reddit",
  "is the JR pass worth it",
  "hakone ryokan under $150",
  "tokyo to kyoto train time",
  "april weather japan",
  "osaka 2 day itinerary blog",
  "fushimi inari crowds",
  "google maps · saved",
  "currency converter",
  "hostel vs hotel kyoto",
];

const DAYS = [
  {
    day: "01",
    code: "SAY IT",
    title: "One sentence is the whole form.",
    body: "Where, how long, what you love, what you can spend. Type it the way you'd text a friend. No dropdowns, no date pickers, no account.",
    demo: <TypeDemo />,
    tone: "light" as const,
  },
  {
    day: "02",
    code: "PLAN IT",
    title: "Watch the planner work, step by step.",
    body: "It reads your wish, scouts places, routes between them, checks typical weather for your month and balances the budget. Every step shows up on the board as it happens.",
    demo: <PlanDemo />,
    tone: "dark" as const,
  },
  {
    day: "03",
    code: "DRAG IT",
    title: "Don't like a stop? Drag the pin.",
    body: "Drop it anywhere on the globe. Wanderpals names the new spot, re-times the whole day around it and tells you what it cost in travel time.",
    demo: <DragDemo />,
    tone: "light" as const,
  },
  {
    day: "04",
    code: "BUDGET",
    title: "A budget meter with feelings.",
    body: "Stays, food, fun and getting around add up live as you change the plan. Under budget, Momo smiles. Over budget, Momo sweats. Try it.",
    demo: <BudgetDemo />,
    tone: "light" as const,
  },
  {
    day: "05",
    code: "FLY IT",
    title: "Press play for the movie version.",
    body: "The camera falls from space to street level, rides the arcs between cities with the crew and narrates each day out loud. It's the trip before the trip.",
    demo: <FlyDemo />,
    tone: "dark" as const,
  },
  {
    day: "06",
    code: "VOTE",
    title: "Let the group chat decide.",
    body: "Spare ideas land on a vote board. Friends heart what they want and the winners join the plan. Share one link; the whole trip travels inside it.",
    demo: <VoteDemo />,
    tone: "dark" as const,
  },
];

const FAQ = [
  {
    q: "Is it really free?",
    a: "Yes. There are no accounts and no paid keys. The map, weather and place lookups all use free public services.",
  },
  {
    q: "Are the prices real?",
    a: "They're friendly estimates, not quotes. Rooms, meals, tickets and transit are ballpark numbers so you can see the shape of a budget. Check before you book.",
  },
  {
    q: "Where does the information come from?",
    a: "Eight countries have a hand-picked set of places. Anywhere else, Wanderpals finds the city on OpenStreetMap and reads up on nearby places from Wikipedia. Typical weather comes from last year's Open-Meteo observations.",
  },
  {
    q: "Does it use AI?",
    a: "Out of the box it runs on its own planning engine. If whoever runs it connects an AI model, the model scouts the cities and places, and the engine still does the scheduling and budget math.",
  },
  {
    q: "Where are my trips saved?",
    a: "On your device, plus inside the share link itself. There's no server copy, so nobody else sees your trip unless you send the link.",
  },
];

const CREW: PalId[] = ["momo", "pip", "lux", "dot", "zuzu"];
const CREW_JOINS: Record<PalId, string> = {
  momo: "Joins when you mention food, markets or coffee.",
  pip: "Joins for hikes, trails, beaches and slow days.",
  lux: "Always comes. Somebody has to take the photos.",
  dot: "Joins for museums, temples, ruins and castles.",
  zuzu: "Joins for nightlife, bars and shopping.",
};

export default function Landing() {
  return (
    <div className="overflow-x-clip">
      {/* ---------- nav ---------- */}
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
        <nav className="mx-auto flex max-w-[1240px] items-center justify-between gap-3 rounded-full bg-white/80 py-2 pl-3 pr-2 ring-[3px] ring-ink backdrop-blur-md sm:pl-4">
          <Link href="/" aria-label="Wanderpals home">
            <Logo size={34} />
          </Link>
          <div className="hidden items-center gap-6 font-display text-[15px] font-bold text-ink md:flex">
            <a href="#how" className="hover:text-coral">How it works</a>
            <a href="#crew" className="hover:text-coral">The crew</a>
            <a href="#departures" className="hover:text-coral">Departures</a>
            <a href="#faq" className="hover:text-coral">FAQ</a>
          </div>
          <Link
            href="/plan"
            className="flex items-center gap-2 rounded-full bg-coral px-4 py-2.5 font-display text-[15px] font-extrabold text-white ring-[3px] ring-ink transition hover:-translate-y-0.5 hover:bg-[#ff5a43]"
          >
            Plan a trip <ArrowRight className="size-4" strokeWidth={3} />
          </Link>
        </nav>
      </header>

      {/* ---------- hero ---------- */}
      <section className="mx-auto grid max-w-[1240px] items-center gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
        <div className="rise-in">
          <h1 className="flex flex-col items-start gap-2">
            <span className="sr-only">Where to next, pal? Wanderpals plans your trip from one sentence.</span>
            <FlapText text="WHERE TO" size="xl" className="!text-[clamp(34px,6vw,70px)]" />
            <FlapText text="NEXT, PAL?" size="xl" tone="sun" delay={400} className="!text-[clamp(34px,6vw,70px)]" />
          </h1>
          <p className="mt-6 max-w-[34ch] font-display text-[clamp(22px,2.4vw,30px)] font-bold leading-[1.15] tracking-[-0.02em] text-ink">
            Say one sentence. Get a day-by-day trip on a 3D globe, then fly through it with the crew.
          </p>
          <div className="mt-7 max-w-[560px]">
            <LandingPrompt />
          </div>
          <p className="mt-3 text-[14px] font-semibold text-ink/65">Free. No account. Try a country, a city, or anywhere at all.</p>
        </div>

        <div className="relative">
          <div className="relative aspect-square overflow-hidden rounded-[36px] bg-gradient-to-b from-[#5DB8FF] to-[#DDF2FF] ring-[3px] ring-ink shadow-[0_40px_60px_-30px_rgba(22,35,59,.55)] sm:aspect-[5/4.4]">
            <HeroGlobe />
            <div className="pointer-events-none absolute left-4 top-4 board flex items-center gap-2 rounded-2xl px-3 py-2">
              <FlapText text="NOW BOARDING" size="xs" tone="sun" />
              <FlapText text="KYOTO" length={6} size="xs" delay={900} />
            </div>
          </div>
          <div className="pointer-events-none absolute -bottom-7 left-1/2 flex -translate-x-1/2 items-end gap-1 sm:gap-2">
            {CREW.map((id, i) => (
              <Pal key={id} id={id} size={[54, 62, 72, 60, 52][i]} wave={id === "lux"} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 20 tabs ---------- */}
      <section className="bg-ink py-20 text-flap">
        <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr]">
          <div>
            <h2 className="font-display text-[clamp(32px,4.4vw,56px)] font-extrabold leading-[1] tracking-[-0.04em]">
              Trip planning shouldn&apos;t take 20 tabs.
            </h2>
            <p className="mt-4 max-w-[46ch] text-[16px] leading-relaxed text-flap/70">
              Blogs, maps, train times, hotel prices, weather. Lists that never show how far apart things are or how long you&apos;ll sit on a train.
            </p>
            <ul className="mt-7 flex flex-wrap gap-2" aria-label="The usual open tabs">
              {TABS.map((t, i) => (
                <li
                  key={t}
                  className="rounded-t-xl bg-ink-2 px-3 py-2 text-[13px] font-semibold text-flap/60 ring-1 ring-ink-3"
                  style={{ transform: `rotate(${((i * 37) % 9) - 4}deg)` }}
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <ArrowRight className="mx-auto size-12 rotate-90 text-sun lg:rotate-0" strokeWidth={3} aria-hidden />
          <div className="board rounded-[28px] bg-ink-2 p-6 ring-2 ring-ink-3">
            <FlapText text="ONE SENTENCE" size="md" tone="sun" />
            <p className="mt-4 font-display text-[clamp(22px,2.4vw,30px)] font-bold leading-snug">
              &ldquo;10 days in Japan in April, I love food and hiking, budget 2000 dollars.&rdquo;
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["10 days", "4 cities", "30 stops", "$1,843 est.", "typical 11–19°C"].map((c) => (
                <span key={c} className="chip bg-ink-3 text-flap">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- the itinerary of the product ---------- */}
      <section id="how" className="mx-auto max-w-[1240px] scroll-mt-24 px-4 py-20 sm:px-6">
        <div className="max-w-[680px]">
          <FlapText text="YOUR ITINERARY" size="md" />
          <h2 className="mt-4 font-display text-[clamp(34px,5vw,64px)] font-extrabold leading-[0.98] tracking-[-0.045em] text-ink">
            Six days, from &ldquo;where to?&rdquo; to wheels up.
          </h2>
          <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed text-ink/75">
            Scroll the trip. The crew walks the route with you, and every stop below is the real thing, working.
          </p>
        </div>

        <div id="itinerary" className="mt-14 grid gap-10 lg:grid-cols-[1fr_340px]">
          <ol className="flex flex-col gap-10">
            {DAYS.map((d) => (
              <li
                key={d.day}
                className={`grid gap-6 rounded-[30px] p-5 ring-[3px] ring-ink sm:p-8 lg:min-h-[70vh] lg:content-center ${d.tone === "dark" ? "bg-ink text-flap" : "bg-white/85 text-ink"}`}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="board inline-flex items-center gap-2 rounded-xl px-2.5 py-1.5">
                    <FlapText text={`DAY ${d.day}`} size="sm" tone="sun" />
                  </span>
                  <FlapText text={d.code} size="sm"  />
                </div>
                <div>
                  <h3 className="max-w-[20ch] font-display text-[clamp(28px,3.4vw,44px)] font-extrabold leading-[1.02] tracking-[-0.04em]">{d.title}</h3>
                  <p className={`mt-3 max-w-[54ch] text-[16px] leading-relaxed ${d.tone === "dark" ? "text-flap/70" : "text-ink/70"}`}>{d.body}</p>
                </div>
                <div>{d.demo}</div>
              </li>
            ))}
          </ol>
          <div className="hidden lg:block">
            <div className="sticky top-28">
              <RouteRail sectionId="itinerary" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- crew ---------- */}
      <section id="crew" className="scroll-mt-24 bg-gradient-to-b from-[#3BB2FF] to-[#9FD6FF] py-20">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="max-w-[16ch] font-display text-[clamp(34px,5vw,64px)] font-extrabold leading-[0.98] tracking-[-0.045em] text-ink">
              Nobody travels alone here.
            </h2>
            <p className="max-w-[44ch] text-[17px] leading-relaxed text-ink/80">
              Tell us what you love and the right pals join your crew. They ride the arcs on the globe, react to your budget and narrate the flyover.
            </p>
          </div>
          <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            {CREW.map((id) => (
              <li key={id} className="flex flex-col items-center text-center">
                <Pal id={id} size={132} wave={id === "lux"} />
                <p className="mt-3 font-display text-[28px] font-extrabold tracking-[-0.03em] text-ink">{PALS[id].name}</p>
                <p className="font-flap text-[15px] font-extrabold tracking-[0.12em] text-ink/70">{PALS[id].role.toUpperCase()}</p>
                <p className="mt-2 max-w-[24ch] text-[14px] leading-snug text-ink/80">{CREW_JOINS[id]}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- departures ---------- */}
      <section id="departures" className="mx-auto max-w-[1240px] scroll-mt-24 px-4 py-20 sm:px-6">
        <div className="board overflow-hidden rounded-[32px] p-5 sm:p-9">
          <div className="board-rule mb-6" />
          <div className="flex flex-wrap items-end justify-between gap-4">
            <FlapText text="DEPARTURES" size="xl" className="!text-[clamp(30px,5vw,58px)]" />
            <p className="max-w-[38ch] text-[15px] text-flap/70">Tap a flight to plan it instantly, or type anywhere on Earth in the box below.</p>
          </div>
          <div className="mt-8 grid grid-cols-[4rem_1fr_auto] gap-x-4 px-3 pb-2 font-flap text-[14px] font-extrabold tracking-[0.14em] text-sun sm:grid-cols-[5rem_1fr_4rem_9rem]">
            <span>FLIGHT</span>
            <span>DESTINATION</span>
            <span className="hidden sm:block">TRIP</span>
            <span className="text-right">STATUS</span>
          </div>
          <ul className="flex flex-col gap-1.5">
            {SUGGESTED_TRIPS.map((t, i) => (
              <li key={t.code}>
                <Link
                  href={`/plan#q=${encodeURIComponent(t.label)}`}
                  className="group grid grid-cols-[4rem_1fr_auto] items-center gap-x-4 rounded-2xl px-3 py-3 transition hover:bg-ink-2 sm:grid-cols-[5rem_1fr_4rem_9rem]"
                >
                  <FlapText text={t.code} size="md" tone="sun" delay={i * 100} />
                  <span className="min-w-0">
                    <span className="block overflow-hidden">
                      <FlapText text={t.dest} length={11} size="md" delay={200 + i * 100} />
                    </span>
                    <span className="mt-1 block truncate text-[13px] text-flap/55">{t.label}</span>
                  </span>
                  <span className="hidden sm:block">
                    <FlapText text={t.time} length={3} size="md" delay={300 + i * 100} />
                  </span>
                  <span className="flex justify-end">
                    <span className="chip bg-mint/15 font-flap text-[14px] tracking-[0.12em] text-mint transition group-hover:bg-coral group-hover:text-white">
                      <span className="group-hover:hidden">ON TIME</span>
                      <span className="hidden group-hover:inline">BOARD NOW</span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 max-w-[620px]">
            <LandingPrompt placeholder="Or anywhere: 4 days in Edinburgh, history and pubs" />
          </div>
        </div>
      </section>

      {/* ---------- faq ---------- */}
      <section id="faq" className="mx-auto max-w-[920px] scroll-mt-24 px-4 pb-20 sm:px-6">
        <h2 className="font-display text-[clamp(32px,4.4vw,52px)] font-extrabold tracking-[-0.04em] text-ink">Good questions</h2>
        <div className="mt-8 flex flex-col gap-3">
          {FAQ.map((f) => (
            <details key={f.q} className="group rounded-2xl bg-white/85 px-5 py-4 ring-[3px] ring-ink open:bg-white">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-[19px] font-extrabold tracking-[-0.02em] text-ink">
                {f.q}
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sun font-flap text-[20px] ring-2 ring-ink transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-[64ch] text-[16px] leading-relaxed text-ink/75">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ---------- final call ---------- */}
      <section className="px-4 pb-10 sm:px-6">
        <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[36px] bg-coral px-6 pb-12 pt-20 text-center ring-[3px] ring-ink sm:px-10">
          <div className="absolute left-1/2 top-6 flex -translate-x-1/2 items-end gap-1">
            {CREW.map((id, i) => (
              <Pal key={id} id={id} size={[40, 46, 52, 44, 40][i]} mood="cheer" />
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <span className="board rounded-2xl px-4 py-3">
              <FlapText text="FINAL CALL" size="lg" tone="sun" />
            </span>
          </div>
          <h2 className="mx-auto mt-6 max-w-[18ch] font-display text-[clamp(34px,5vw,64px)] font-extrabold leading-[0.98] tracking-[-0.045em] text-white">
            Your crew is at the gate.
          </h2>
          <div className="mx-auto mt-8 max-w-[620px] text-left">
            <LandingPrompt />
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 pb-12 pt-6 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div>
          <Logo size={34} />
          <p className="mt-3 max-w-[42ch] text-[13px] leading-relaxed text-ink/65">
            Map data © OpenStreetMap contributors, tiles by OpenFreeMap. Weather by Open-Meteo. Place summaries from Wikipedia. Prices and times are estimates.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 font-display text-[15px] font-bold text-ink">
          <Link href="/plan" className="hover:text-coral">Planner</Link>
          <Link href="/brand" className="hover:text-coral">Brand kit</Link>
          <a href="#faq" className="hover:text-coral">FAQ</a>
        </nav>
      </footer>
    </div>
  );
}
