"use client";

import { useEffect, useRef, useState } from "react";
import { FlapText } from "../FlapText";
import { GlobeMap } from "../GlobeMap";
import { Pal } from "../Pal";

const noop = () => {};

export function HeroGlobe() {
  return (
    <GlobeMap
      variant="hero"
      itinerary={null}
      activeDay={null}
      activeStopId={null}
      crewMood="happy"
      onSelectDay={noop}
      onSelectStop={noop}
      onStopMoved={noop}
    />
  );
}

export const ROUTE_STOPS = [
  { day: "01", label: "SAY IT" },
  { day: "02", label: "PLAN IT" },
  { day: "03", label: "DRAG IT" },
  { day: "04", label: "BUDGET" },
  { day: "05", label: "FLY IT" },
  { day: "06", label: "VOTE" },
];

// A winding route; the stops sit at these fractions of its length.
const PATH = "M255 30 C315 100 195 150 255 190 S315 290 255 330 S195 430 255 470 S315 570 255 610 S195 710 255 760";
const STOP_AT = [0, 0.19, 0.38, 0.58, 0.79, 1];

/**
 * The itinerary section's sticky companion: as the page scrolls through the six
 * days, the crew walks the route and each stop's board flaps to "BOARDED".
 */
export function RouteRail({ sectionId }: { sectionId: string }) {
  const pathRef = useRef<SVGPathElement>(null);
  const [progress, setProgress] = useState(0);
  const [pos, setPos] = useState({ x: 255, y: 30 });
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    setPoints(STOP_AT.map((f) => path.getPointAtLength(f * len)));
  }, []);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const section = document.getElementById(sectionId);
      const path = pathRef.current;
      if (!section || !path) return;
      const r = section.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.5 - r.top) / (r.height - window.innerHeight * 0.4)));
      setProgress(p);
      const pt = path.getPointAtLength(p * path.getTotalLength());
      setPos({ x: pt.x, y: pt.y });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [sectionId]);

  const reached = STOP_AT.filter((f) => progress >= f - 0.02).length;

  return (
    <div className="relative mx-auto h-[min(78vh,760px)] w-full max-w-[340px]">
      <svg viewBox="0 0 320 800" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <path d={PATH} fill="none" stroke="#16233B" strokeWidth="12" strokeLinecap="round" opacity=".14" />
        <path ref={pathRef} d={PATH} fill="none" stroke="#16233B" strokeWidth="9" strokeLinecap="round" />
        <path
          d={PATH}
          fill="none"
          stroke="#FFC93C"
          strokeWidth="4.5"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${progress} 1`}
        />
        {points.map((pt, i) => (
          <g key={i} transform={`translate(${pt.x} ${pt.y})`}>
            <circle r="14" fill={i < reached ? "#FF6B57" : "#FFF4D6"} stroke="#16233B" strokeWidth="4" style={{ transition: "fill .4s" }} />
          </g>
        ))}
      </svg>
      {points.map((pt, i) => (
        <div key={i} className="absolute left-0 flex w-[58%] -translate-y-1/2 justify-end" style={{ top: `${(pt.y / 800) * 100}%` }}>
          <div className={`board flex items-center gap-1.5 rounded-xl px-2 py-1.5 transition-opacity duration-500 ${i < reached ? "opacity-100" : "opacity-55"}`}>
            <FlapText text={ROUTE_STOPS[i].day} size="xs" tone="sun" />
            <FlapText text={i < reached ? ROUTE_STOPS[i].label : ""} length={7} size="xs" />
          </div>
        </div>
      ))}
      <div
        className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-[92%] items-end -space-x-2"
        style={{ left: `${(pos.x / 320) * 100}%`, top: `${(pos.y / 800) * 100}%` }}
      >
        <Pal id="lux" size={46} mood={progress >= 0.99 ? "cheer" : "happy"} />
        <Pal id="momo" size={38} />
        <Pal id="pip" size={38} />
      </div>
    </div>
  );
}
