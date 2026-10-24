"use client";

import { ArrowUp } from "lucide-react";
import { useState } from "react";

export function PromptBar({
  onSubmit,
  busy,
  placeholder = "10 days in Japan in April, food and hiking, $2000",
  initial = "",
  compact = false,
}: {
  onSubmit: (text: string) => void;
  busy: boolean;
  placeholder?: string;
  initial?: string;
  compact?: boolean;
}) {
  const [text, setText] = useState(initial);
  return (
    <form
      className={`group relative flex items-center gap-2 rounded-full bg-white p-1.5 pl-5 shadow-[0_14px_30px_-12px_rgba(22,35,59,.45)] ring-[3px] ring-ink transition focus-within:ring-sun ${compact ? "" : "sm:p-2 sm:pl-6"}`}
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim() && !busy) onSubmit(text.trim());
      }}
    >
      <label htmlFor={compact ? "prompt-compact" : "prompt"} className="sr-only">
        Describe your trip
      </label>
      <input
        id={compact ? "prompt-compact" : "prompt"}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        maxLength={400}
        className={`min-w-0 flex-1 bg-transparent font-display font-semibold text-ink outline-none placeholder:text-ink-soft/60 ${compact ? "text-[15px]" : "text-base sm:text-lg"}`}
      />
      <button
        type="submit"
        disabled={busy || !text.trim()}
        aria-label={busy ? "Planning your trip" : "Plan this trip"}
        className={`grid shrink-0 place-items-center rounded-full bg-coral text-white ring-[3px] ring-ink transition hover:-translate-y-0.5 hover:bg-[#ff5a43] active:translate-y-0 disabled:cursor-not-allowed disabled:bg-ink-soft/40 ${compact ? "size-10" : "size-11 sm:size-12"}`}
      >
        {busy ? (
          <span className="size-4 animate-spin rounded-full border-[3px] border-white border-t-transparent" />
        ) : (
          <ArrowUp strokeWidth={3} className="size-5" />
        )}
      </button>
    </form>
  );
}
