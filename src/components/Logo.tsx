// The mark is one split-flap tile: the flap seam is the globe's equator, and
// the route under it bends into a smile that ends at a pin.

export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} role="img" aria-label="Wanderpals">
      <rect x="2" y="2" width="60" height="60" rx="13" fill="#16233B" />
      <path d="M2 15 a13 13 0 0 1 13 -13 h34 a13 13 0 0 1 13 13 v16 h-60z" fill="#22365A" />
      <circle cx="32" cy="32" r="19" fill="#3BB2FF" />
      <path d="M13 32 a19 19 0 0 1 38 0z" fill="#5CC3FF" />
      <path d="M32 13 c-8 6 -8 13 -6 19" fill="none" stroke="#16233B" strokeWidth="2.2" strokeLinecap="round" opacity=".55" />
      <path d="M20 37 q12 13 24 0" fill="none" stroke="#FFF4D6" strokeWidth="3.4" strokeLinecap="round" strokeDasharray="0.1 5.6" />
      <circle cx="44.5" cy="36.6" r="4.2" fill="#FF6B57" stroke="#16233B" strokeWidth="2" />
      <rect x="0" y="31" width="64" height="2" fill="#16233B" />
      <rect x="1" y="28.5" width="4" height="7" rx="1.5" fill="#FFC93C" />
      <rect x="59" y="28.5" width="4" height="7" rx="1.5" fill="#FFC93C" />
    </svg>
  );
}

export function Logo({ size = 40, tone = "ink" }: { size?: number; tone?: "ink" | "light" }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span
        className="font-display font-extrabold tracking-[-0.035em] leading-none"
        style={{ fontSize: size * 0.62, color: tone === "ink" ? "var(--ink)" : "var(--flap)" }}
      >
        wanderpals
      </span>
    </span>
  );
}
