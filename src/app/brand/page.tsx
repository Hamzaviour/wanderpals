import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Play, Plane } from "lucide-react";
import { FlapText } from "@/components/FlapText";
import { Logo, LogoMark } from "@/components/Logo";
import { Pal, PALS } from "@/components/Pal";
import type { PalId } from "@/lib/types";

export const metadata: Metadata = {
  title: "Brand kit · Wanderpals",
  description: "The Wanderpals identity: the flap-globe mark, the departure-board palette, the type, and the crew.",
};

const COLORS = [
  { name: "Board Ink", hex: "#16233B", text: "#FFF4D6", role: "Every board, outline and letter of the system." },
  { name: "Flap White", hex: "#FFF4D6", text: "#16233B", role: "Letters on the board." },
  { name: "Sunshine", hex: "#FFC93C", text: "#16233B", role: "Routes, highlights, the rule." },
  { name: "Coral", hex: "#FF6B57", text: "#16233B", role: "The one big action." },
  { name: "Mint", hex: "#2FD4A3", text: "#16233B", role: "On time, under budget." },
  { name: "Grape", hex: "#8C6CFF", text: "#FFFFFF", role: "Sights and views." },
  { name: "Tangerine", hex: "#FF9F2E", text: "#16233B", role: "Food." },
  { name: "Sky", hex: "#3BB2FF", text: "#16233B", role: "Nights out, the globe." },
];

const CAST: PalId[] = ["momo", "pip", "lux", "dot", "zuzu"];

function Panel({ label, n, className = "", dark = false, children }: { label: string; n: number; className?: string; dark?: boolean; children: React.ReactNode }) {
  return (
    <section className={`relative overflow-hidden rounded-[26px] p-6 sm:p-7 ${dark ? "bg-ink text-flap" : "bg-white text-ink"} ${className}`}>
      <div className={`mb-5 flex items-center justify-between font-flap text-[13px] font-extrabold tracking-[0.16em] ${dark ? "text-sun" : "text-ink/55"}`}>
        <span>{label}</span>
        <span>{String(n).padStart(2, "0")}</span>
      </div>
      {children}
    </section>
  );
}

export default function BrandPage() {
  return (
    <main className="min-h-dvh px-4 pb-16 pt-6 sm:px-8">
      <header className="mx-auto flex max-w-[1240px] items-center justify-between">
        <Link href="/" className="chip bg-white py-2 text-ink ring-[3px] ring-ink transition hover:-translate-y-0.5">
          <ArrowLeft className="size-4" strokeWidth={2.5} /> Back to the globe
        </Link>
        <span className="font-flap text-[14px] font-extrabold tracking-[0.16em] text-ink/70">BRAND KIT · V1</span>
      </header>

      <div className="mx-auto mt-6 grid max-w-[1240px] gap-4 md:grid-cols-6">
        {/* 1. cover */}
        <Panel label="IDENTITY" n={1} dark className="md:col-span-4 md:row-span-2">
          <div className="flex min-h-[360px] flex-col justify-between gap-10">
            <div className="flex flex-wrap items-center gap-5">
              <LogoMark size={120} />
              <div>
                <p className="font-display text-[clamp(44px,7vw,92px)] font-extrabold leading-[0.9] tracking-[-0.045em]">wanderpals</p>
                <p className="mt-2 text-[15px] text-flap/70">A trip planner with a crew. Formerly WanderGlobe.</p>
              </div>
            </div>
            <div>
              <div className="flex flex-col gap-1.5">
                <FlapText text="WHERE TO NEXT" size="lg" />
                <FlapText text="PAL?" size="lg" tone="sun" delay={400} />
              </div>
              <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-flap/75">
                The airport departure board is the most exciting screen in the world: every row is a place you could be tomorrow.
                Wanderpals turns your trip into that board, and puts a crew of travel buddies on it.
              </p>
            </div>
          </div>
        </Panel>

        {/* 2. construction */}
        <Panel label="THE MARK" n={2} className="md:col-span-2 md:row-span-2">
          <svg viewBox="0 0 240 240" className="mx-auto w-full max-w-[280px]" role="img" aria-label="Logo construction">
            <g transform="translate(40 40) scale(2.5)">
              <LogoMarkInner />
            </g>
            <g fill="none" stroke="#FF6B57" strokeWidth="1.5" strokeDasharray="4 4">
              <circle cx="120" cy="120" r="47.5" />
              <path d="M20 120 H220" />
            </g>
          </svg>
          <ul className="mt-3 grid gap-1 font-flap text-[13px] font-extrabold tracking-[0.12em]">
            <li>TILE = DEPARTURE</li>
            <li>SEAM = EQUATOR</li>
            <li>ROUTE = SMILE · PIN = YOU</li>
          </ul>
          <p className="mt-4 text-[14px] leading-relaxed text-ink/70">
            One split-flap tile. Its seam is the globe&apos;s equator, the route under it bends into a smile, and the pin is you.
            Hinge pins in Sunshine tie it to the board rule.
          </p>
          <div className="mt-5 flex items-end gap-4">
            <LogoMark size={64} />
            <LogoMark size={40} />
            <LogoMark size={24} />
            <LogoMark size={16} />
          </div>
        </Panel>

        {/* 3. cast */}
        <Panel label="THE CREW" n={3} className="bg-gradient-to-b from-[#5DB8FF] to-[#DDF2FF] md:col-span-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {CAST.map((id, i) => (
              <div key={id} className="flex flex-col items-center text-center">
                <div style={{ animationDelay: `${i * 0.2}s` }}>
                  <Pal id={id} size={120} wave={id === "lux"} />
                </div>
                <p className="mt-3 font-display text-[24px] font-extrabold tracking-[-0.03em] text-ink">{PALS[id].name}</p>
                <p className="font-flap text-[14px] font-extrabold tracking-[0.12em] text-ink/70">{PALS[id].role.toUpperCase()}</p>
                <p className="mt-1.5 max-w-[24ch] text-[14px] text-ink/75">{PALS[id].line}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-3 rounded-2xl bg-white/70 p-4 sm:grid-cols-3">
            {(["happy", "wow", "sweat"] as const).map((m) => (
              <div key={m} className="flex items-center gap-3">
                <Pal id="momo" size={52} mood={m} bob={false} />
                <p className="text-[14px] font-semibold text-ink">
                  {m === "happy" ? "Comfortably under budget." : m === "wow" ? "Getting close to the limit." : "Over budget. Momo is sweating."}
                </p>
              </div>
            ))}
          </div>
        </Panel>

        {/* 4. tagline */}
        <Panel label="ESSENCE" n={4} dark className="md:col-span-3">
          <p className="font-display text-[clamp(40px,6vw,76px)] font-extrabold leading-[0.95] tracking-[-0.045em]">
            Every route
            <br />
            is a <span className="text-sun">smile.</span>
          </p>
          <p className="mt-5 max-w-[46ch] text-[15px] text-flap/70">
            Voice: a friend who already loves the place. Short sentences, real names, honest numbers. Never salesy, never &ldquo;unlock your dream getaway.&rdquo;
          </p>
        </Panel>

        {/* 5. color */}
        <Panel label="COLOR" n={5} className="md:col-span-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {COLORS.map((c) => (
              <div key={c.hex} className="flex aspect-[3/4] flex-col justify-between rounded-2xl p-3 ring-2 ring-ink/10" style={{ background: c.hex, color: c.text }}>
                <span className="font-flap text-[13px] font-extrabold tracking-[0.1em]">{c.hex}</span>
                <span>
                  <span className="block font-display text-[15px] font-extrabold leading-tight">{c.name}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug opacity-80">{c.role}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 h-12 rounded-2xl bg-gradient-to-r from-[#5DB8FF] via-[#9FD6FF] to-[#DDF2FF] px-3 py-2 font-flap text-[13px] font-extrabold tracking-[0.1em] text-ink">
            DAYLIGHT · THE SKY BEHIND EVERYTHING
          </div>
        </Panel>

        {/* 6. type */}
        <Panel label="TYPE" n={6} className="md:col-span-2">
          <p className="font-flap text-[56px] font-extrabold leading-none tracking-[0.04em]">KYOTO 11:00</p>
          <p className="mt-1 text-[13px] font-semibold text-ink/60">Big Shoulders · flap tiles, codes, times</p>
          <p className="mt-5 font-display text-[40px] font-extrabold leading-none tracking-[-0.04em]">Fushimi Inari</p>
          <p className="mt-1 text-[13px] font-semibold text-ink/60">Bricolage Grotesque · names and headlines</p>
          <p className="mt-5 text-[16px] leading-relaxed">Ten thousand orange gates up a mountain. Go early.</p>
          <p className="mt-1 text-[13px] font-semibold text-ink/60">Figtree · everything you read</p>
        </Panel>

        {/* 7. boarding pass */}
        <Panel label="PHYSICAL" n={7} className="bg-[#DDF2FF] md:col-span-2">
          <div className="relative rotate-[-3deg] rounded-[20px] bg-white p-4 shadow-[0_20px_30px_-16px_rgba(22,35,59,.5)] ring-[3px] ring-ink">
            <div className="flex items-center justify-between">
              <Logo size={22} />
              <span className="font-flap text-[13px] font-extrabold tracking-[0.12em] text-coral">BOARDING PASS</span>
            </div>
            <div className="mt-4 flex items-center justify-between font-flap font-extrabold">
              <span className="text-[38px] leading-none">HND</span>
              <Plane className="size-6 text-coral" strokeWidth={2.5} />
              <span className="text-[38px] leading-none">KIX</span>
            </div>
            <div className="mt-1 flex justify-between text-[12px] font-semibold text-ink/60">
              <span>Tokyo</span>
              <span>Osaka</span>
            </div>
            <div className="my-3 border-t-[3px] border-dashed border-ink/20" />
            <div className="flex items-end justify-between">
              <div className="grid grid-cols-3 gap-3 font-flap text-[13px] font-extrabold tracking-[0.08em]">
                <span>
                  <span className="block text-ink/50">GATE</span>A7
                </span>
                <span>
                  <span className="block text-ink/50">SEAT</span>12F
                </span>
                <span>
                  <span className="block text-ink/50">CREW</span>3
                </span>
              </div>
              <div className="-mb-1 flex -space-x-3">
                <Pal id="lux" size={34} bob={false} />
                <Pal id="momo" size={30} bob={false} />
                <Pal id="pip" size={30} bob={false} />
              </div>
            </div>
          </div>
          <p className="mt-5 text-[13px] font-semibold text-ink/60">Sample ticket for print, stickers and social posts.</p>
        </Panel>

        {/* 8. system */}
        <Panel label="SYSTEM" n={8} dark className="md:col-span-2">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip bg-mint/15 font-flap text-[13px] tracking-[0.12em] text-mint">ON TIME</span>
              <span className="chip bg-sun text-ink">Add</span>
              <span className="chip bg-coral text-white">Stop</span>
              <span className="chip bg-ink-3 text-flap">April</span>
            </div>
            <div className="flex items-end gap-4 rounded-2xl bg-[#F6F1DE] p-4">
              {(["#2FD4A3", "#FF9F2E", "#8C6CFF", "#FF6B57"] as const).map((c, i) => (
                <span key={c} className="stop-pin" style={{ background: c }}>
                  <span>{i + 1}</span>
                </span>
              ))}
              <span className="city-badge">
                <b>6</b>KYOTO
              </span>
            </div>
            <span className="flex items-center gap-3 self-start rounded-full bg-coral py-2 pl-2 pr-5 font-display text-[16px] font-extrabold text-white ring-[3px] ring-ink">
              <span className="grid size-9 place-items-center rounded-full bg-white text-coral ring-[3px] ring-ink">
                <Play className="size-4 fill-current" strokeWidth={2.5} />
              </span>
              Play flyover
            </span>
            <div className="board-rule" />
          </div>
        </Panel>
      </div>
    </main>
  );
}

/** The mark's paths without the outer svg, for the construction drawing. */
function LogoMarkInner() {
  return (
    <>
      <rect x="2" y="2" width="60" height="60" rx="13" fill="#16233B" />
      <path d="M2 15 a13 13 0 0 1 13 -13 h34 a13 13 0 0 1 13 13 v16 h-60z" fill="#22365A" />
      <circle cx="32" cy="32" r="19" fill="#3BB2FF" />
      <path d="M13 32 a19 19 0 0 1 38 0z" fill="#5CC3FF" />
      <path d="M20 37 q12 13 24 0" fill="none" stroke="#FFF4D6" strokeWidth="3.4" strokeLinecap="round" strokeDasharray="0.1 5.6" />
      <circle cx="44.5" cy="36.6" r="4.2" fill="#FF6B57" stroke="#16233B" strokeWidth="2" />
      <rect x="0" y="31" width="64" height="2" fill="#16233B" />
      <rect x="1" y="28.5" width="4" height="7" rx="1.5" fill="#FFC93C" />
      <rect x="59" y="28.5" width="4" height="7" rx="1.5" fill="#FFC93C" />
    </>
  );
}
