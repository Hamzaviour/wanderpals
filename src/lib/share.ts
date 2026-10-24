import type { Itinerary } from "./types";

export type Votes = Record<string, string[]>;

export interface SharedTrip {
  itinerary: Itinerary;
  votes: Votes;
}

function toBase64Url(bytes: Uint8Array) {
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) {
  const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

/** The whole trip rides in the URL hash, compressed. No server, no account. */
export async function encodeTrip(trip: SharedTrip) {
  const json = new TextEncoder().encode(JSON.stringify(trip));
  return toBase64Url(await pipe(json, new CompressionStream("deflate-raw")));
}

export async function decodeTrip(code: string): Promise<SharedTrip | null> {
  try {
    const json = await pipe(fromBase64Url(code), new DecompressionStream("deflate-raw"));
    const trip = JSON.parse(new TextDecoder().decode(json)) as SharedTrip;
    return trip?.itinerary?.days?.length ? trip : null;
  } catch {
    return null;
  }
}

const KEY = "wanderpals:last-trip";

export function saveLocal(trip: SharedTrip) {
  try {
    localStorage.setItem(KEY, JSON.stringify(trip));
  } catch {
    /* storage full or blocked: the share link still works */
  }
}

export function loadLocal(): SharedTrip | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SharedTrip) : null;
  } catch {
    return null;
  }
}

export function clearLocal() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
