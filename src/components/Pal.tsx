import type { PalId } from "@/lib/types";

export type Mood = "happy" | "wow" | "sweat" | "sleep" | "cheer";

export const PALS: Record<PalId, { name: string; role: string; color: string; shade: string; line: string }> = {
  momo: { name: "Momo", role: "the foodie", color: "#FF9F2E", shade: "#E87B12", line: "Momo has already found the snack stand." },
  pip: { name: "Pip", role: "the hiker", color: "#2FD4A3", shade: "#17A97F", line: "Pip packed trail mix for everyone." },
  lux: { name: "Lux", role: "the photographer", color: "#8C6CFF", shade: "#6A47EA", line: "Lux is framing the perfect shot." },
  dot: { name: "Dot", role: "the history nerd", color: "#FF6B57", shade: "#E04A36", line: "Dot brought three guidebooks. Again." },
  zuzu: { name: "Zuzu", role: "the night owl", color: "#3BB2FF", shade: "#1690E0", line: "Zuzu is asking where the party is." },
};

const INK = "#16233B";

function Face({ mood }: { mood: Mood }) {
  const closed = mood === "sleep" || mood === "cheer";
  return (
    <g>
      {closed ? (
        <g fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round">
          <path d={mood === "cheer" ? "M40 74 Q46 66 52 74" : "M40 72 Q46 77 52 72"} />
          <path d={mood === "cheer" ? "M68 74 Q74 66 80 74" : "M68 72 Q74 77 80 72"} />
        </g>
      ) : (
        <g className="pal-eyes">
          <ellipse cx="46" cy="71" rx={mood === "wow" ? 6 : 5} ry={mood === "wow" ? 7.5 : 6.5} fill={INK} />
          <ellipse cx="74" cy="71" rx={mood === "wow" ? 6 : 5} ry={mood === "wow" ? 7.5 : 6.5} fill={INK} />
          <circle cx="48" cy="68" r="2" fill="#fff" />
          <circle cx="76" cy="68" r="2" fill="#fff" />
        </g>
      )}
      <ellipse cx="36" cy="84" rx="7" ry="4.5" fill="#FF7EB6" opacity=".55" />
      <ellipse cx="84" cy="84" rx="7" ry="4.5" fill="#FF7EB6" opacity=".55" />
      {mood === "wow" ? (
        <ellipse cx="60" cy="90" rx="5.5" ry="7" fill={INK} />
      ) : mood === "sweat" ? (
        <>
          <path d="M51 91 q4.5 -4 9 0 t9 0" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M92 52 q6 9 0 13 q-6 -4 0 -13z" fill="#9ADFFF" stroke={INK} strokeWidth="2" />
        </>
      ) : mood === "sleep" ? (
        <path d="M55 89 h10" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      ) : (
        <path d={mood === "cheer" ? "M50 85 Q60 99 70 85 Z" : "M51 86 Q60 95 69 86"} fill={mood === "cheer" ? INK : "none"} stroke={INK} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </g>
  );
}

function Gear({ id }: { id: PalId }) {
  switch (id) {
    case "momo":
      return (
        <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
          <path d="M40 34 h40 v-8 H40z" fill="#fff" />
          <circle cx="45" cy="20" r="11" fill="#fff" />
          <circle cx="60" cy="13" r="13" fill="#fff" />
          <circle cx="75" cy="20" r="11" fill="#fff" />
          <path d="M40 26 h40" stroke="#fff" strokeWidth="6" />
          {/* onigiri in hand */}
          <path d="M96 104 l10 -16 l10 16 q0 4 -4 4 h-12 q-4 0 -4 -4z" fill="#fff" />
          <rect x="101" y="99" width="10" height="9" rx="1.5" fill={INK} stroke="none" />
        </g>
      );
    case "pip":
      return (
        <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
          <path d="M33 44 Q36 16 60 15 Q84 16 87 44 Z" fill="#FF6B57" />
          <path d="M31 42 h58 v8 h-58z" fill="#FFC93C" />
          <circle cx="60" cy="12" r="7" fill="#FFC93C" />
          <path d="M34 66 Q30 96 38 118" fill="none" stroke="#7A4A22" strokeWidth="6" />
          <path d="M86 66 Q90 96 82 118" fill="none" stroke="#7A4A22" strokeWidth="6" />
        </g>
      );
    case "lux":
      return (
        <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
          <path d="M38 60 Q60 112 82 60" fill="none" stroke={INK} strokeWidth="2.5" />
          <rect x="44" y="96" width="32" height="22" rx="5" fill="#FFF4D6" />
          <rect x="50" y="92" width="10" height="6" rx="2" fill="#FFF4D6" />
          <circle cx="60" cy="107" r="7.5" fill={INK} />
          <circle cx="62" cy="105" r="2.2" fill="#fff" stroke="none" />
          <path d="M57 22 q3 -10 6 0" fill="none" />
        </g>
      );
    case "dot":
      return (
        <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
          <path d="M30 34 Q40 12 70 16 Q92 20 90 32 Q60 40 30 34z" fill={INK} />
          <circle cx="64" cy="13" r="4" fill={INK} />
          <circle cx="46" cy="71" r="11" fill="none" strokeWidth="3" />
          <circle cx="74" cy="71" r="11" fill="none" strokeWidth="3" />
          <path d="M57 70 h6" />
        </g>
      );
    case "zuzu":
      return (
        <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
          <path d="M52 22 q4 -14 10 -2 q6 -12 8 4" fill="none" strokeLinecap="round" />
          <path d="M46 60 l3.5 7 7.5 1 -5.5 5.2 1.4 7.6 -6.9 -3.6 -6.9 3.6 1.4 -7.6 -5.5 -5.2 7.5 -1z" fill="#FFC93C" />
          <path d="M74 60 l3.5 7 7.5 1 -5.5 5.2 1.4 7.6 -6.9 -3.6 -6.9 3.6 1.4 -7.6 -5.5 -5.2 7.5 -1z" fill="#FFC93C" />
          <path d="M56 70 h8" />
        </g>
      );
  }
}

export function Pal({
  id,
  mood = "happy",
  size = 64,
  wave = false,
  bob = true,
  className = "",
  title,
}: {
  id: PalId;
  mood?: Mood;
  size?: number;
  wave?: boolean;
  bob?: boolean;
  className?: string;
  title?: string;
}) {
  const pal = PALS[id];
  const hideEyes = id === "zuzu" && mood !== "sleep" && mood !== "cheer";
  return (
    <svg
      viewBox="0 0 120 140"
      width={size}
      height={(size * 140) / 120}
      className={`pal ${bob ? "pal-bob" : ""} ${className}`}
      role="img"
      aria-label={title ?? `${pal.name}, ${pal.role}`}
    >
      <ellipse cx="60" cy="134" rx="34" ry="5" fill={INK} opacity=".18" />
      {/* arms */}
      <path d="M18 88 q-12 6 -10 18" fill="none" stroke={INK} strokeWidth="11" strokeLinecap="round" />
      <path d="M18 88 q-12 6 -10 18" fill="none" stroke={pal.color} strokeWidth="5" strokeLinecap="round" />
      <g className={wave ? "pal-wave" : ""} style={{ transformOrigin: "100px 88px" }}>
        <path d="M102 88 q12 6 10 18" fill="none" stroke={INK} strokeWidth="11" strokeLinecap="round" />
        <path d="M102 88 q12 6 10 18" fill="none" stroke={pal.color} strokeWidth="5" strokeLinecap="round" />
      </g>
      {/* feet */}
      <ellipse cx="45" cy="128" rx="11" ry="7" fill={pal.shade} stroke={INK} strokeWidth="3" />
      <ellipse cx="75" cy="128" rx="11" ry="7" fill={pal.shade} stroke={INK} strokeWidth="3" />
      {/* body */}
      <path
        d="M60 28 C94 28 107 54 106 86 C105 116 88 126 60 126 C32 126 15 116 14 86 C13 54 26 28 60 28Z"
        fill={pal.color}
        stroke={INK}
        strokeWidth="3.5"
      />
      <path d="M22 98 C28 118 44 122 60 122 C76 122 92 118 98 98 C88 112 32 112 22 98Z" fill={pal.shade} opacity=".55" />
      <ellipse cx="40" cy="48" rx="10" ry="6" fill="#fff" opacity=".35" transform="rotate(-25 40 48)" />
      {hideEyes ? (
        <g>
          <ellipse cx="36" cy="84" rx="7" ry="4.5" fill="#FF7EB6" opacity=".55" />
          <ellipse cx="84" cy="84" rx="7" ry="4.5" fill="#FF7EB6" opacity=".55" />
          {mood === "sweat" ? (
            <path d="M51 92 q4.5 -4 9 0 t9 0" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
          ) : (
            <path d="M51 88 Q60 97 69 88" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
          )}
        </g>
      ) : (
        <Face mood={mood} />
      )}
      <Gear id={id} />
    </svg>
  );
}
