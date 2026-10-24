"use client";

import type { GeoJSONSource, Map as MLMap, Marker, StyleSpecification } from "maplibre-gl";
import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { createPortal } from "react-dom";
import { greatCircle } from "@/lib/geo";
import type { Day, Itinerary, PalId, StopKind } from "@/lib/types";
import { Pal, type Mood } from "./Pal";

export const KIND_COLOR: Record<StopKind, string> = {
  food: "#FF9F2E",
  hike: "#2FD4A3",
  sight: "#8C6CFF",
  culture: "#FF6B57",
  night: "#3BB2FF",
  shop: "#FF7EB6",
  relax: "#7EE0C3",
};

export interface GlobeHandle {
  flyTo: (o: { lng: number; lat: number; zoom: number; pitch?: number; bearing?: number; duration?: number; curve?: number }) => Promise<void>;
  overview: (duration?: number) => Promise<void>;
  /** Moves the pal crew along the arc into a day's city. */
  travelTo: (day: Day, from: Day | undefined, ms: number) => Promise<void>;
  rotate: (degrees: number, ms: number) => Promise<void>;
  fitPoints: (pts: { lat: number; lng: number }[], o?: { pitch?: number; bearing?: number; duration?: number; maxZoom?: number }) => Promise<void>;
}

const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

/** Repaint OpenFreeMap's Liberty style in the Wanderpals daylight palette. */
function brandStyle(style: StyleSpecification): StyleSpecification {
  const layers = style.layers.map((l) => {
    const paint = { ...(("paint" in l && l.paint) || {}) } as Record<string, unknown>;
    if (l.type === "background") paint["background-color"] = "#F6F1DE";
    else if (l.id === "natural_earth") paint["raster-opacity"] = ["interpolate", ["linear"], ["zoom"], 0, 0.45, 6, 0.15];
    else if (l.id === "water") paint["fill-color"] = "#6CCBF2";
    else if (l.id.startsWith("waterway") && l.type === "line") paint["line-color"] = "#6CCBF2";
    else if (l.id === "park" || l.id === "landcover_grass") paint["fill-color"] = "#BFEAA2";
    else if (l.id === "landcover_wood") paint["fill-color"] = "#9FDB93";
    else if (l.id === "landcover_sand") paint["fill-color"] = "#FFE7A8";
    else if (l.id === "landuse_residential") paint["fill-color"] = "#F1E7CF";
    else if (l.id === "building") paint["fill-color"] = "#EADFC6";
    else if (l.id === "building-3d") {
      paint["fill-extrusion-color"] = ["interpolate", ["linear"], ["get", "render_height"], 0, "#F4E9D0", 60, "#FFD7A0", 200, "#FFB38A"];
    } else if (l.id.startsWith("boundary") && l.type === "line") paint["line-color"] = "#9A8BC9";
    else if (l.type === "symbol" && l.id.startsWith("label_")) {
      paint["text-color"] = "#16233B";
      paint["text-halo-color"] = "#FFFFFF";
      // English names first so the globe reads the same for everyone
      const layout = { ...(l.layout ?? {}), "text-field": ["coalesce", ["get", "name:en"], ["get", "name:latin"], ["get", "name"]] };
      return { ...l, paint, layout } as typeof l;
    }
    return { ...l, paint } as typeof l;
  });
  return {
    ...style,
    layers,
    projection: { type: "globe" },
    sky: {
      "sky-color": "#5DB8FF",
      "horizon-color": "#DDF2FF",
      "fog-color": "#DDF2FF",
      "sky-horizon-blend": 0.6,
      "horizon-fog-blend": 0.7,
      "fog-ground-blend": 0.85,
      "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 5, 1, 8, 0],
    },
  } as StyleSpecification;
}

function cityLegs(it: Itinerary) {
  const cities: Day[] = [];
  it.days.forEach((d) => {
    if (cities.at(-1)?.cityId !== d.cityId) cities.push(d);
  });
  return cities;
}

function wait(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export function GlobeMap({
  itinerary,
  activeDay,
  activeStopId,
  crewMood,
  onSelectDay,
  onSelectStop,
  onStopMoved,
  variant = "app",
  ref,
}: {
  itinerary: Itinerary | null;
  activeDay: number | null;
  activeStopId: string | null;
  crewMood: Mood;
  onSelectDay: (day: number) => void;
  onSelectStop: (id: string) => void;
  onStopMoved: (id: string, lat: number, lng: number) => void;
  /** "hero" is a hands-off spinning globe for the landing page */
  variant?: "app" | "hero";
  ref?: Ref<GlobeHandle>;
}) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const lib = useRef<typeof import("maplibre-gl") | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const stopMarkers = useRef(new Map<string, Marker>());
  const cityMarkers = useRef(new Map<string, Marker>());
  const crewMarker = useRef<Marker | null>(null);
  const [crewEl, setCrewEl] = useState<HTMLElement | null>(null);
  const [hopKey, setHopKey] = useState(0);
  const spin = useRef(true);
  const drawnId = useRef<string | null>(null);
  const handlers = useRef({ onSelectDay, onSelectStop, onStopMoved });
  useEffect(() => {
    handlers.current = { onSelectDay, onSelectStop, onStopMoved };
  });

  // ---- boot the map once
  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    (async () => {
      try {
        const maplibre = await import("maplibre-gl");
        // the worker is served from /public (copied on install) so bundlers don't have to resolve it
        maplibre.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
        lib.current = maplibre;
        const raw = (await (await fetch(STYLE_URL)).json()) as StyleSpecification;
        if (cancelled || !container.current) return;
        const map = new maplibre.Map({
          container: container.current,
          style: brandStyle(raw),
          center: [20, 22],
          zoom: idleZoom(variant),
          interactive: variant === "app",
          attributionControl: false,
          maxPitch: 75,
        });
        mapRef.current = map;
        map.addControl(new maplibre.AttributionControl({ compact: true }), variant === "hero" ? "top-right" : "bottom-right");
        map.on("load", () => {
          map.addSource("arcs", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
          map.addSource("paths", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
          map.addLayer({
            id: "paths",
            type: "line",
            source: "paths",
            paint: {
              "line-color": ["case", ["get", "active"], "#FF6B57", "#16233B"],
              "line-width": ["interpolate", ["linear"], ["zoom"], 8, 1.5, 15, 4],
              "line-opacity": ["case", ["get", "active"], 0.95, 0.35],
              "line-dasharray": [1.2, 1.6],
            },
            layout: { "line-cap": "round" },
          });
          map.addLayer({
            id: "arcs-casing",
            type: "line",
            source: "arcs",
            paint: { "line-color": "#16233B", "line-width": ["interpolate", ["linear"], ["zoom"], 1, 5, 8, 9], "line-opacity": 0.9 },
            layout: { "line-cap": "round", "line-join": "round" },
          });
          map.addLayer({
            id: "arcs",
            type: "line",
            source: "arcs",
            paint: { "line-color": "#FFC93C", "line-width": ["interpolate", ["linear"], ["zoom"], 1, 2.5, 8, 5] },
            layout: { "line-cap": "round", "line-join": "round" },
          });
          setReady(true);
        });
        map.on("dragstart", () => (spin.current = false));
        map.on("wheel", () => (spin.current = false));
        // idle spin until someone touches the globe or a trip arrives
        const loop = () => {
          if (spin.current && map.getZoom() < 3 && !map.isMoving()) {
            const c = map.getCenter();
            map.setCenter([c.lng + 0.06, c.lat]);
          }
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // the variant is fixed for the life of a globe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- crew marker (pals ride along on the globe)
  useEffect(() => {
    if (!ready || !lib.current || !mapRef.current) return;
    const el = document.createElement("div");
    el.className = "pointer-events-none";
    crewMarker.current = new lib.current.Marker({ element: el, anchor: "bottom", offset: [0, -26] }).setLngLat([0, 0]);
    setCrewEl(el);
    return () => {
      crewMarker.current?.remove();
      crewMarker.current = null;
    };
  }, [ready]);

  // ---- draw the trip whenever the itinerary changes
  useEffect(() => {
    const map = mapRef.current;
    const maplibre = lib.current;
    if (!ready || !map || !maplibre) return;
    stopMarkers.current.forEach((m) => m.remove());
    stopMarkers.current.clear();
    cityMarkers.current.forEach((m) => m.remove());
    cityMarkers.current.clear();
    const arcs = map.getSource("arcs") as GeoJSONSource;
    const paths = map.getSource("paths") as GeoJSONSource;
    if (!itinerary) {
      arcs.setData({ type: "FeatureCollection", features: [] });
      paths.setData({ type: "FeatureCollection", features: [] });
      crewMarker.current?.remove();
      drawnId.current = null;
      spin.current = true;
      // park the globe beside the welcome board
      map.easeTo({ zoom: idleZoom(variant), pitch: 0, bearing: 0, padding: idlePadding(variant), duration: 1400 });
      return;
    }
    spin.current = false;
    // the idle globe parks itself with a wide padding; clear it or fitBounds can't fit the trip
    map.setPadding({ top: 0, right: 0, bottom: 0, left: 0 });

    const legs = cityLegs(itinerary);
    const fullArcs = legs.slice(1).map((d, i) => greatCircle([legs[i].lng, legs[i].lat], [d.lng, d.lat], 80));
    // draw arcs progressively, like ink running along the route
    let raf = 0;
    const start = performance.now();
    const drawArcs = (t: number) => {
      const p = Math.min(1, (t - start) / 1800);
      const ease = 1 - (1 - p) ** 3;
      arcs.setData({
        type: "FeatureCollection",
        features: fullArcs.map((coords, i) => {
          const local = Math.max(0, Math.min(1, ease * fullArcs.length - i));
          const n = Math.max(2, Math.ceil(coords.length * local));
          return { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: local > 0 ? coords.slice(0, n) : [] } };
        }),
      });
      if (p < 1) raf = requestAnimationFrame(drawArcs);
    };
    raf = requestAnimationFrame(drawArcs);

    // a brand new trip opens on the whole route
    if (drawnId.current !== itinerary.id) {
      drawnId.current = itinerary.id;
      const b = new maplibre.LngLatBounds();
      itinerary.days.forEach((d) => {
        b.extend([d.lng, d.lat]);
        d.stops.forEach((s) => b.extend([s.lng, s.lat]));
      });
      map.fitBounds(b, { padding: { ...paddingForViewport(), top: 120, bottom: 160 }, duration: 3200, pitch: 20, bearing: 0, maxZoom: 9 });
    }

    // city badges
    legs.forEach((d) => {
      const days = itinerary.days.filter((x) => x.cityId === d.cityId).map((x) => x.day);
      // MapLibre owns the marker element's transform, so styling lives on a child
      const el = document.createElement("div");
      const badge = document.createElement("button");
      badge.className = "city-badge";
      badge.type = "button";
      badge.innerHTML = `<b>${days[0]}</b>${d.city.toUpperCase()}`;
      badge.setAttribute("aria-label", `Day ${days[0]}: ${d.city}`);
      badge.addEventListener("click", (e) => {
        e.stopPropagation();
        handlers.current.onSelectDay(days[0]);
      });
      el.appendChild(badge);
      const m = new maplibre.Marker({ element: el, anchor: "left", offset: [10, 0] }).setLngLat([d.lng, d.lat]).addTo(map);
      cityMarkers.current.set(d.cityId, m);
    });

    // stop pins, draggable to replan
    itinerary.days.forEach((d) =>
      d.stops.forEach((s, i) => {
        const el = document.createElement("div");
        el.className = "stop-pin-wrap";
        el.dataset.day = String(d.day);
        el.title = `${s.name}. Drag me somewhere new.`;
        const pin = document.createElement("div");
        pin.className = "stop-pin";
        pin.style.background = KIND_COLOR[s.kind];
        pin.innerHTML = `<span>${i + 1}</span>`;
        el.appendChild(pin);
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          handlers.current.onSelectStop(s.id);
        });
        const m = new maplibre.Marker({ element: el, draggable: true, anchor: "bottom" }).setLngLat([s.lng, s.lat]).addTo(map);
        m.on("dragstart", () => pin.classList.add("is-dragging"));
        m.on("dragend", () => {
          pin.classList.remove("is-dragging");
          const { lat, lng } = m.getLngLat();
          handlers.current.onStopMoved(s.id, lat, lng);
        });
        stopMarkers.current.set(s.id, m);
      }),
    );

    return () => cancelAnimationFrame(raf);
  }, [itinerary, ready, variant]);

  // ---- highlight the active day and stop
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !itinerary) return;
    const paths = map.getSource("paths") as GeoJSONSource;
    paths.setData({
      type: "FeatureCollection",
      features: itinerary.days.map((d) => ({
        type: "Feature",
        properties: { active: d.day === activeDay },
        geometry: { type: "LineString", coordinates: d.stops.map((s) => [s.lng, s.lat]) },
      })),
    });
    stopMarkers.current.forEach((m, id) => {
      const el = m.getElement();
      const onDay = Number(el.dataset.day) === activeDay;
      el.firstElementChild?.classList.toggle("is-active", id === activeStopId);
      el.style.opacity = activeDay == null || onDay ? "1" : "0.45";
      el.style.zIndex = onDay ? "2" : "1";
    });
    const day = itinerary.days.find((d) => d.day === activeDay) ?? itinerary.days[0];
    cityMarkers.current.forEach((m, id) => m.getElement().firstElementChild?.classList.toggle("is-active", id === day.cityId && activeDay != null));
    if (crewMarker.current && !crewMarker.current.getElement().dataset.travelling) {
      crewMarker.current.setLngLat([day.lng, day.lat]).addTo(map);
    }
  }, [activeDay, activeStopId, itinerary, ready]);

  const flyTo = useCallback<GlobeHandle["flyTo"]>((o) => {
    const map = mapRef.current;
    if (!map) return Promise.resolve();
    spin.current = false;
    return new Promise((resolve) => {
      map.once("moveend", () => resolve());
      map.flyTo({
        center: [o.lng, o.lat],
        zoom: o.zoom,
        pitch: o.pitch ?? 0,
        bearing: o.bearing ?? 0,
        duration: o.duration ?? 2400,
        curve: o.curve ?? 1.5,
        essential: true,
        padding: paddingForViewport(),
      });
    });
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      flyTo,
      overview: (duration = 2200) => {
        const map = mapRef.current;
        const maplibre = lib.current;
        if (!map || !maplibre || !itinerary) return Promise.resolve();
        const b = new maplibre.LngLatBounds();
        itinerary.days.forEach((d) => {
          b.extend([d.lng, d.lat]);
          d.stops.forEach((s) => b.extend([s.lng, s.lat]));
        });
        return new Promise((resolve) => {
          map.once("moveend", () => resolve());
          map.fitBounds(b, { padding: { ...paddingForViewport(), top: 120, bottom: 160 }, duration, pitch: 20, bearing: 0, maxZoom: 9 });
        });
      },
      fitPoints: (pts, o = {}) => {
        const map = mapRef.current;
        const maplibre = lib.current;
        if (!map || !maplibre || !pts.length) return Promise.resolve();
        spin.current = false;
        const b = new maplibre.LngLatBounds();
        pts.forEach((p) => b.extend([p.lng, p.lat]));
        return new Promise((resolve) => {
          map.once("moveend", () => resolve());
          map.fitBounds(b, {
            padding: { ...paddingForViewport(), top: 110, bottom: 110 },
            pitch: o.pitch ?? 45,
            bearing: o.bearing ?? 0,
            duration: o.duration ?? 2400,
            maxZoom: o.maxZoom ?? 14.5,
            curve: 1.5,
          } as Parameters<typeof map.fitBounds>[1]);
        });
      },
      rotate: (degrees, ms) => {
        const map = mapRef.current;
        if (!map) return Promise.resolve();
        return new Promise((resolve) => {
          map.once("moveend", () => resolve());
          map.easeTo({ bearing: map.getBearing() + degrees, duration: ms, easing: (t) => t });
        });
      },
      travelTo: async (day, from, ms) => {
        const marker = crewMarker.current;
        const map = mapRef.current;
        if (!marker || !map) return;
        if (!from || from.cityId === day.cityId) {
          marker.setLngLat([day.lng, day.lat]).addTo(map);
          return;
        }
        const coords = greatCircle([from.lng, from.lat], [day.lng, day.lat], 120);
        marker.getElement().dataset.travelling = "1";
        setHopKey((k) => k + 1);
        const b = new (lib.current!.LngLatBounds)();
        coords.forEach((c) => b.extend(c));
        map.fitBounds(b, { padding: { ...paddingForViewport(), top: 160, bottom: 200 }, duration: ms * 0.5, pitch: 35, maxZoom: 9 });
        const t0 = performance.now();
        await new Promise<void>((resolve) => {
          const step = (t: number) => {
            const p = Math.min(1, (t - t0) / ms);
            const e = p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2;
            marker.setLngLat(coords[Math.round(e * (coords.length - 1))]);
            if (p < 1) requestAnimationFrame(step);
            else resolve();
          };
          requestAnimationFrame(step);
        });
        delete marker.getElement().dataset.travelling;
        setHopKey((k) => k + 1);
        await wait(150);
      },
    }),
    [flyTo, itinerary],
  );

  return (
    <div className="absolute inset-0">
      <div ref={container} className="h-full w-full" aria-label="3D globe showing your trip" role="region" />
      {failed && (
        <div className="absolute inset-0 grid place-items-center p-8 text-center">
          <p className="max-w-sm rounded-2xl bg-white/80 p-5 font-semibold">
            The globe couldn&apos;t load its map tiles. Check your connection; your plan still works on the board.
          </p>
        </div>
      )}
      {crewEl &&
        itinerary &&
        createPortal(
          <div key={hopKey} className="pal-hop flex items-end -space-x-3 drop-shadow-[0_8px_8px_rgba(22,35,59,.35)]">
            {itinerary.pals.map((p: PalId, i) => (
              <Pal key={p} id={p} size={i === 0 ? 46 : 36} mood={crewMood} wave={i === 0 && crewMood === "happy"} />
            ))}
          </div>,
          crewEl,
        )}
    </div>
  );
}

function idleZoom(variant: "app" | "hero") {
  if (variant === "hero") return window.innerWidth < 760 ? 0.6 : 1.3;
  return window.innerWidth < 760 ? 0.55 : window.innerHeight < 760 ? 1.35 : 1.7;
}

function idlePadding(variant: "app" | "hero") {
  if (variant === "hero") return { left: 0, right: 0, top: 0, bottom: 0 };
  const w = window.innerWidth;
  if (w < 1024) return { left: 0, right: 0, top: 40, bottom: Math.round(window.innerHeight * 0.5) };
  return { left: Math.min(760, w * 0.5), right: 0, top: 40, bottom: 0 };
}

function paddingForViewport() {
  if (typeof window === "undefined") return { left: 0, right: 0, top: 0, bottom: 0 };
  const w = window.innerWidth;
  if (w < 900) return { left: 20, right: 20, top: 80, bottom: Math.round(window.innerHeight * 0.45) };
  // clear of the board on the left and the budget meter on the right
  return { left: Math.min(470, w * 0.36), right: Math.min(340, w * 0.24), top: 60, bottom: 60 };
}
