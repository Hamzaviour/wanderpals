<div align="center">

<img src="src/app/icon.svg" width="96" alt="Wanderpals logo" />

# Wanderpals

**Where to next, pal?**

Say one sentence about a trip. Wanderpals plans it day by day, pins it on a 3D globe,<br/>
and flies you through it with a crew of little traveler pals.

Free to run · no accounts · no paid API keys

[![Watch the launch video](docs/media/wanderpals-poster.jpg)](docs/media/wanderpals-launch.mp4)

▶ **[Watch the 45-second launch video](docs/media/wanderpals-launch.mp4)**

</div>

---

## Screenshots

| Landing page | Planner at work |
|---|---|
| ![Landing page hero with the flap-board headline and the spinning globe](docs/screenshots/landing.png) | ![The planner streaming its steps onto the departure board](docs/screenshots/planning.png) |

| The trip on the globe | A day up close |
|---|---|
| ![10 days in Japan: route arcs, city badges, budget meter](docs/screenshots/trip.png) | ![Day 6 in Kyoto with numbered stops and the crew](docs/screenshots/trip-day.png) |

| Live demos on the landing page | Brand kit |
|---|---|
| ![The landing page itinerary with the budget meter demo](docs/screenshots/landing-itinerary.png) | ![Brand kit page: logo, construction and the crew](docs/screenshots/brand.png) |

<p align="center">
  <img src="docs/screenshots/mobile.png" width="300" alt="The planner on a phone" />
</p>

## What it does

- **One-sentence planning.** "10 days in Japan in April, I love food and hiking, budget 2000 dollars." Days, month, budget, travelers and interests are read from the sentence.
- **A planner you can watch.** Each step (read the wish → scout places → route → typical weather → balance the budget) flips onto a split-flap departure board as it happens.
- **3D globe.** A MapLibre globe on free OpenFreeMap tiles, repainted in the Wanderpals palette. Arcs draw between cities, numbered pins mark every stop, and 3D buildings appear at street level.
- **Board ↔ camera sync.** Scroll the itinerary and the camera follows the day at the top. Tap a city or a stop to fly there.
- **Drag to replan.** Drag any pin. The new spot is named from Wikipedia or OpenStreetMap, the day is re-timed, and the change in travel time is reported. One-click undo.
- **A budget meter with feelings.** Stays, food, fun and transit add up live. Momo smiles under budget and sweats over it.
- **Cinematic flyover.** A letterboxed tour from space to street level: the crew rides the arcs, captions flap in, and the browser narrates each day.
- **Friends vote.** Spare ideas go to a vote board. Votes sync between tabs, and the share link carries the trip plus the votes.
- **Share links.** The whole trip is compressed into the URL. No server storage.

## Meet the crew

| Pal | Joins your crew when… |
|---|---|
| **Momo** · the foodie | you mention food, markets or coffee |
| **Pip** · the hiker | you want trails, beaches or slow days |
| **Lux** · the photographer | always. Somebody has to take the photos |
| **Dot** · the history nerd | you mention museums, temples or castles |
| **Zuzu** · the night owl | you want nightlife or shopping |

## Getting started

Requires Node.js 20+.

```bash
npm install     # also copies the MapLibre worker into public/maplibre
npm run dev
```

Open http://localhost:3000.

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |

## Routes

| Route | What |
|---|---|
| `/` | Landing page |
| `/plan` | The planner (`/plan#q=…` plans a sentence, `/plan#t=…` opens a shared trip) |
| `/brand` | Brand kit: mark, palette, type and the crew |
| `POST /api/plan` | Streams planner steps and the itinerary as NDJSON |
| `GET /api/place?lat=&lng=` | Names a dropped pin |

## Deploy to Vercel

The repo includes a `vercel.json`, so deploying is just:

1. Push this repo to GitHub.
2. In Vercel, choose **Add New → Project** and import the repo. The Next.js preset is picked up automatically.
3. Click **Deploy**.

Or from the command line:

```bash
npm i -g vercel
vercel          # preview deployment
vercel --prod   # production
```

No environment variables are required. The `postinstall` script copies the MapLibre worker into `public/` during the Vercel install step, and both API routes allow up to 30 seconds for the free weather and Wikipedia lookups.

### Optional: AI scout

Copy `.env.example` to `.env.local` (or add the variables in Vercel → Settings → Environment Variables) and set both:

| Variable | Purpose |
|---|---|
| `AI_SCOUT_API_KEY` | API key for a Messages-API compatible model provider |
| `AI_SCOUT_MODEL` | Model id to use |

With both set, a hosted model scouts cities and places for any destination. The built-in engine still does the scheduling, routing and budget math, and falls back to its own planner if the model is unavailable.

## Where the data comes from

- **Hand-picked places** for Japan, Italy, Peru, Iceland, Morocco, Portugal, Mexico and Thailand (`src/lib/data/destinations.ts`).
- **Anywhere else:** OpenStreetMap (Nominatim) geocoding plus Wikipedia geosearch for nearby places.
- **Typical weather:** last year's daily observations for the trip month, from the Open-Meteo archive.
- **Travel times and prices are estimates** and are labeled as such everywhere.

## How it's built

```
src/lib/types.ts             Itinerary schema, the single source of truth
src/lib/planner/parse.ts     Sentence → trip request
src/lib/planner/engine.ts    Tool loop: places → route → weather → budget
src/lib/planner/tools.ts     Open-Meteo, Nominatim, Wikipedia (keyless, with timeouts)
src/lib/planner/ai-scout.ts  Optional hosted-model scout
src/lib/itinerary.ts         Re-timing days, legs between stops
src/lib/budget.ts            Budget math
src/components/GlobeMap.tsx  MapLibre globe that renders purely from the itinerary
src/components/TripApp.tsx   App state, edits, undo, share, flyover
src/app/page.tsx             Landing page
```

The globe renders only from the itinerary JSON, so every planner update or edit re-renders the map.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · MapLibre GL 6 · Zod · lucide icons.

## Credits

Map data © OpenStreetMap contributors · Tiles by OpenFreeMap · Weather by Open-Meteo · Place summaries from Wikipedia.
Launch video music: "Happy Beats / Business Moves" by ende.app. Sound effects: Kenney.nl (CC0).
