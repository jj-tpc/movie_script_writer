'use client';

import type { EventType, KeyEvent } from '@/types';

const TYPE_TINTS: Record<EventType, { bg: string; text: string }> = {
  '발단': { bg: 'bg-[var(--tint-green-bg)]', text: 'text-[var(--tint-green-ink)]' },
  '전개': { bg: 'bg-[var(--tint-blue-bg)]', text: 'text-[var(--tint-blue-ink)]' },
  '위기': { bg: 'bg-[var(--tint-amber-bg)]', text: 'text-[var(--tint-amber-ink)]' },
  '절정': { bg: 'bg-[var(--tint-red-bg)]', text: 'text-[var(--tint-red-ink)]' },
  '결말': { bg: 'bg-[var(--color-brand-subtle)]', text: 'text-[var(--color-brand-on-subtle)]' },
};

interface EventCardProps {
  event: KeyEvent;
  onEdit: () => void;
  onRemove: () => void;
}

export default function EventCard({ event, onEdit, onRemove }: EventCardProps) {
  const tint = TYPE_TINTS[event.type] ?? TYPE_TINTS['전개'];

  return (
    <div className="group flex gap-4 rounded-xl bg-[var(--bg-raised)] p-5
                    transition-colors duration-[var(--duration-normal)]
                    hover:bg-[var(--surface-hover)]">
      {/* Sequence number — large, scene-number style */}
      <div className="flex shrink-0 items-start">
        <span
          className="text-display inline-flex h-10 w-10 items-center justify-center
                     rounded-lg bg-[var(--bg-sunken)] text-lg font-bold
                     tabular-nums text-[var(--text-tertiary)]"
        >
          {event.sequence}
        </span>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center gap-2.5">
          <h4 className="text-display text-base font-semibold text-[var(--text-primary)]">
            {event.title}
          </h4>
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tint.bg} ${tint.text}`}
          >
            {event.type}
          </span>
        </div>

        {event.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">
            {event.description}
          </p>
        )}
      </div>

      {/* Actions — appear on hover */}
      <div
        className="flex shrink-0 flex-col gap-1 opacity-0
                   transition-opacity duration-[var(--duration-fast)]
                   group-hover:opacity-100"
      >
        <button
          type="button"
          onClick={onEdit}
          className="rounded-md px-2 py-1 text-xs text-[var(--text-secondary)]
                     transition-colors duration-[var(--duration-fast)]
                     hover:bg-[var(--surface-active)] hover:text-[var(--text-primary)]"
          aria-label={`${event.title} 수정`}
        >
          수정
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md px-2 py-1 text-xs text-[var(--text-tertiary)]
                     transition-colors duration-[var(--duration-fast)]
                     hover:bg-[var(--color-error-subtle-hover)] hover:text-[var(--color-error)]"
          aria-label={`${event.title} 삭제`}
        >
          삭제
        </button>
      </div>
    </div>
  );
}
