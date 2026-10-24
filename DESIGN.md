# Design

## World: the departure board on a sunny day

The itinerary is a split-flap departure board; the trip is the globe outside the terminal window. Refuses the black-space globe with neon arcs and the cream travel-journal look.

- **Board surfaces** (`.board`): Board Ink `#16233B`, 22px radius, soft offset shadow. Rows sit on `--ink-2 #22365A` and `--ink-3 #2E4670`.
- **Sky** behind everything: `#5DB8FF → #9FD6FF → #DDF2FF`, fixed. The MapLibre sky/fog uses the same stops.
- **Board rule** (`.board-rule`): Sunshine dashes on ink, opens every board.
- **Outlines**: interactive pieces outside boards carry a 3px ink ring (prompt bar, buttons, pins, cards on sky).

## Color

| Token | Hex | Role |
|---|---|---|
| ink | `#16233B` | boards, outlines, text on light |
| flap | `#FFF4D6` | letters on the board |
| sun | `#FFC93C` | route arcs, highlights, active ring, focus |
| coral | `#FF6B57` | the one primary action, over-budget |
| mint | `#2FD4A3` | on time, under budget, done |
| grape | `#8C6CFF` | sights |
| tangerine | `#FF9F2E` | food |
| blue | `#3BB2FF` | nights out, globe |
| pink | `#FF7EB6` | shopping, "your pick" |

Stop kinds map to pals and colors in `KIND_COLOR` (`GlobeMap.tsx`). The map is repainted: land `#F6F1DE`, water `#6CCBF2`, parks `#BFEAA2`, warm building extrusions.

## Type

- **Big Shoulders** (700–900, `font-flap`): split-flap tiles, codes, times, small caps labels with 0.12–0.16em tracking.
- **Bricolage Grotesque** (`font-display`): names and headlines, extrabold, tracking down to -0.045em.
- **Figtree** (`font-sans`): body copy.

## Components

- **FlapText**: one tile per character; tiles riffle through random characters and land left to right, with a 120ms fold. Optional WebAudio clack (off by default). Honors reduced motion.
- **Pal**: five SVG characters (Momo tangerine foodie, Pip mint hiker, Lux grape photographer, Dot coral history nerd, Zuzu sky night owl). Moods: happy, wow, sweat, sleep, cheer. Bob, blink and wave loops.
- **Logo**: one flap tile whose seam is the globe's equator, a dotted smile route and a coral pin, with sunshine hinge pins.
- **Stop pin**: teardrop in the kind color, ink border, number in Big Shoulders. Styling lives on a child element because MapLibre owns the marker transform.
- **City badge**: ink pill with a sunshine day number; coral when active.
- **Chips**: pill, 0.78rem bold; tone variants on ink-3, mint/15, sun, coral.

## Motion

- Ease: `--ease-out cubic-bezier(.16,1,.3,1)` for UI. The pals' hop uses squash-and-stretch keyframes (character physics only).
- Signature moments: flaps riffling on every board; arcs drawing like ink along the route; the flyover (letterbox, flap captions, narration).
- `prefers-reduced-motion` disables loops and riffles.

## Layout

- **Planner** (`/plan`): full-bleed globe. Desktop: board panel left (430px), budget meter top right, prompt and Play flyover bottom right; camera padding keeps routes clear of both. Mobile: board is a bottom sheet (54dvh), budget compacts.
- **Landing** (`/`): the page is a trip itinerary. Hero (flap headline, prompt, real spinning globe in a window with the crew on its sill) → 20 tabs vs one sentence → six "days" with live demos beside a sticky route rail the crew walks as you scroll → crew → departures board → FAQ → coral final call.
- **Brand** (`/brand`): numbered panels on the sky.

## Voice

A friend who already loves the place. Short sentences, real names, honest numbers. Prices and times are always labeled as estimates. No invented reviews, customers or claims.
