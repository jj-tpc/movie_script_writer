'use client';

import { useEffect, useState } from 'react';
import { useSynopsisStore } from '@/stores/synopsis-store';

const STEPS = [
  { id: 'section-basics', num: '01', label: '기본 정보' },
  { id: 'section-characters', num: '02', label: '주요 인물' },
  { id: 'section-events', num: '03', label: '주요 사건' },
] as const;

/**
 * Production progress rail — left sidebar on /create.
 * Shows per-section completion and serves as in-page jump nav.
 */
export default function ProductionRail() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    useSynopsisStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  const title = useSynopsisStore((s) => s.title);
  const genre = useSynopsisStore((s) => s.genre);
  const charactersCount = useSynopsisStore((s) => s.characters.length);
  const eventsCount = useSynopsisStore((s) => s.keyEvents.length);

  if (!hydrated) {
    return <div className="h-48 animate-pulse rounded-lg bg-[var(--bg-sunken)]" />;
  }

  const basicsComplete = !!title.trim() && !!genre;
  const charactersComplete = charactersCount >= 1;
  const eventsComplete = eventsCount >= 1;
  const progress = [basicsComplete, charactersComplete, eventsComplete];
  const completedCount = progress.filter(Boolean).length;

  const details = [
    basicsComplete
      ? title.trim() || '제목 입력됨'
      : '제목 · 장르 필요',
    charactersCount > 0 ? `${charactersCount}명` : '아직 없음',
    eventsCount > 0 ? `${eventsCount}개` : '아직 없음',
  ];

  return (
    <nav aria-label="섹션 탐색" className="flex flex-col gap-6">
      {/* Eyebrow */}
      <div>
        <p className="text-display mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-tertiary)]">
          진행 상황
        </p>
        <p className="text-body text-xs text-[var(--text-tertiary)]">
          <span className="text-[var(--text-secondary)] tabular-nums">
            {completedCount} / {STEPS.length}
          </span>{' '}
          섹션 완료
        </p>
      </div>

      {/* Step list — oversized scene number is the primary mark */}
      <ol className="flex flex-col gap-1.5">
        {STEPS.map((step, i) => {
          const done = progress[i];
          return (
            <li key={step.id}>
              <a
                href={`#${step.id}`}
                className="group grid grid-cols-[auto_1fr] items-center gap-4 rounded-md
                           px-2 py-3 text-left transition-colors
                           duration-[var(--duration-fast)]
                           hover:bg-[var(--surface-hover)]"
              >
                {/* Big scene number — dominant mark */}
                <div className="flex flex-col items-center gap-1.5">
                  <span
                    className={`text-display text-2xl font-black leading-none tabular-nums
                      transition-colors duration-[var(--duration-normal)] ease-out-quart
                      ${
                        done
                          ? 'text-[var(--color-brand)]'
                          : 'text-[var(--text-tertiary)]'
                      }`}
                  >
                    {step.num}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`block h-1 w-1 rounded-full transition-colors
                      duration-[var(--duration-normal)] ease-out-quart
                      ${
                        done
                          ? 'bg-[var(--color-brand)]'
                          : 'bg-[var(--border-default)]'
                      }`}
                  />
                </div>

                {/* Label + detail */}
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {step.label}
                  </span>
                  <span className="truncate text-xs text-[var(--text-tertiary)]">
                    {details[i]}
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
