'use client';

import { useEffect, useState } from 'react';

/**
 * Premiere banner — appears at top of the detail page when the user
 * has just saved a new synopsis (`?new=1`). Auto-dismisses after 6s
 * to stay out of the way once the user starts reading.
 *
 * The tone leans into the filmmaker's-workshop metaphor: a "premiere"
 * is the first public screening — a peak moment that replaces the
 * generic "saved" flat feedback.
 */
export default function PremiereBanner() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setVisible(false), 6000);
    return () => window.clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-8 flex items-center justify-between gap-4 rounded-xl
                 border border-[var(--color-brand)]
                 bg-[var(--color-brand-subtle)]
                 px-5 py-4 transition-opacity duration-[var(--duration-slow)]
                 ease-out-quart"
    >
      <div className="flex items-center gap-4">
        <span className="text-display text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--color-brand-on-subtle)]">
          Premiere
        </span>
        <span
          aria-hidden="true"
          className="h-5 w-px bg-[var(--color-brand)]"
        />
        <span className="text-sm text-[var(--text-primary)]">
          첫 상영을 축하합니다.
          <span className="ml-1.5 text-[var(--text-secondary)]">
            보관함에 걸렸어요.
          </span>
        </span>
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="배너 닫기"
        className="shrink-0 text-xs text-[var(--text-tertiary)] underline
                   transition-colors hover:text-[var(--text-secondary)]"
      >
        닫기
      </button>
    </div>
  );
}
