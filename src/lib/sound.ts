// Tiny synthesized sounds: no audio files, nothing to download.

let ctx: AudioContext | null = null;
let muted = true;
let lastClack = 0;

export function setMuted(m: boolean) {
  muted = m;
  if (!m && !ctx && typeof window !== "undefined") ctx = new AudioContext();
  if (!m) void ctx?.resume();
}

export function isMuted() {
  return muted;
}

/** The split-flap clack: a short filtered noise burst. */
export function clack(volume = 0.05) {
  if (muted || !ctx) return;
  const now = ctx.currentTime;
  if (now - lastClack < 0.035) return;
  lastClack = now;
  const len = Math.floor(ctx.sampleRate * 0.025);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1800 + Math.random() * 900;
  const gain = ctx.createGain();
  gain.gain.value = volume;
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start(now);
}

/** A two-note chime for arrivals. */
export function chime() {
  if (muted || !ctx) return;
  const now = ctx.currentTime;
  [659.25, 987.77].forEach((f, i) => {
    const osc = ctx!.createOscillator();
    const g = ctx!.createGain();
    osc.type = "sine";
    osc.frequency.value = f;
    g.gain.setValueAtTime(0, now + i * 0.14);
    g.gain.linearRampToValueAtTime(0.08, now + i * 0.14 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.14 + 0.6);
    osc.connect(g).connect(ctx!.destination);
    osc.start(now + i * 0.14);
    osc.stop(now + i * 0.14 + 0.7);
  });
}
