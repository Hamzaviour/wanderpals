"use client";

import { Heart, Plus } from "lucide-react";
import { formatUSD } from "@/lib/budget";
import type { Votes } from "@/lib/share";
import type { Itinerary } from "@/lib/types";
import { KIND_COLOR } from "./GlobeMap";

const AVATAR_COLORS = ["#FF9F2E", "#2FD4A3", "#8C6CFF", "#FF6B57", "#3BB2FF", "#FF7EB6"];
function colorFor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export function VoteBoard({
  it,
  votes,
  voter,
  onVoter,
  onVote,
  onAdd,
}: {
  it: Itinerary;
  votes: Votes;
  voter: string;
  onVoter: (name: string) => void;
  onVote: (ideaId: string) => void;
  onAdd: (ideaId: string) => void;
}) {
  const cities = [...new Set(it.ideas.map((i) => i.city))];
  return (
    <div className="scroll-quiet flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pb-4 sm:px-4">
      <div className="rounded-2xl bg-ink-2 p-3.5">
        <label htmlFor="voter" className="font-flap text-[13px] font-extrabold tracking-[0.14em] text-sun">
          WHO&apos;S VOTING?
        </label>
        <input
          id="voter"
          value={voter}
          onChange={(e) => onVoter(e.target.value.slice(0, 18))}
          placeholder="Your name"
          className="mt-1.5 w-full rounded-xl bg-ink px-3 py-2 font-display font-bold text-flap outline-none ring-2 ring-ink-3 focus:ring-sun"
        />
        <p className="mt-2 text-[13px] leading-relaxed text-flap/65">
          Heart the ideas you want. Votes sync live between tabs on this device, and the share link carries them to friends. Top picks can join the plan.
        </p>
      </div>
      {it.ideas.length === 0 && (
        <p className="rounded-2xl bg-ink-2/60 p-4 text-[14px] text-flap/70">
          No spare ideas yet. Remove a stop from the itinerary and it lands here for the group to vote on.
        </p>
      )}
      {cities.map((city) => (
        <section key={city}>
          <h3 className="px-1 pb-1.5 font-flap text-[15px] font-extrabold tracking-[0.1em] text-flap/80">{city.toUpperCase()}</h3>
          <ul className="flex flex-col gap-1.5">
            {it.ideas
              .filter((i) => i.city === city)
              .sort((a, b) => (votes[b.id]?.length ?? 0) - (votes[a.id]?.length ?? 0))
              .map((idea) => {
                const who = votes[idea.id] ?? [];
                const mine = who.includes(voter.trim() || "You");
                return (
                  <li key={idea.id} className="grid grid-cols-[1fr_auto] gap-2 rounded-xl bg-ink-2/70 p-2.5">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-display text-[15px] font-bold text-flap">
                        <span className="size-2.5 shrink-0 rounded-full ring-2 ring-ink" style={{ background: KIND_COLOR[idea.stop.kind] }} />
                        <span className="truncate">{idea.stop.name}</span>
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-[13px] text-flap/60">{idea.stop.blurb}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-[12px] font-bold text-flap/70">{idea.stop.cost ? formatUSD(idea.stop.cost) : "Free"}</span>
                        <span className="flex -space-x-1.5">
                          {who.slice(0, 5).map((n) => (
                            <span
                              key={n}
                              title={n}
                              className="grid size-5 place-items-center rounded-full font-flap text-[11px] font-extrabold text-ink ring-2 ring-ink"
                              style={{ background: colorFor(n) }}
                            >
                              {n[0]?.toUpperCase()}
                            </span>
                          ))}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onVote(idea.id)}
                        aria-pressed={mine}
                        aria-label={`${mine ? "Remove your vote for" : "Vote for"} ${idea.stop.name}`}
                        className={`chip py-1.5 transition ${mine ? "bg-coral text-white" : "bg-ink-3 text-flap hover:bg-ink-soft"}`}
                      >
                        <Heart className={`size-3.5 ${mine ? "fill-current" : ""}`} strokeWidth={2.5} />
                        {who.length}
                      </button>
                      <button
                        type="button"
                        onClick={() => onAdd(idea.id)}
                        className="chip bg-sun py-1.5 text-ink transition hover:-translate-y-0.5"
                        aria-label={`Add ${idea.stop.name} to the plan`}
                      >
                        <Plus className="size-3.5" strokeWidth={3} /> Add
                      </button>
                    </div>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </div>
  );
}
