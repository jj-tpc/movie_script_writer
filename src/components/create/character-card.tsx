'use client';

import type { Character, CharacterRole } from '@/types';

const ROLE_TINTS: Record<CharacterRole, { bg: string; text: string }> = {
  '주인공': { bg: 'bg-[var(--color-brand-subtle)]', text: 'text-[var(--color-brand-on-subtle)]' },
  '조연': { bg: 'bg-[var(--tint-blue-bg)]', text: 'text-[var(--tint-blue-ink)]' },
  '악역': { bg: 'bg-[var(--tint-red-bg)]', text: 'text-[var(--tint-red-ink)]' },
  '멘토': { bg: 'bg-[var(--tint-green-bg)]', text: 'text-[var(--tint-green-ink)]' },
  '조력자': { bg: 'bg-[var(--tint-violet-bg)]', text: 'text-[var(--tint-violet-ink)]' },
  '기타': { bg: 'bg-[var(--bg-sunken)]', text: 'text-[var(--text-tertiary)]' },
};

interface CharacterCardProps {
  character: Character;
  onEdit: () => void;
  onRemove: () => void;
}

export default function CharacterCard({ character, onEdit, onRemove }: CharacterCardProps) {
  const tint = ROLE_TINTS[character.role] ?? ROLE_TINTS['기타'];

  return (
    <div
      className="group relative rounded-xl bg-[var(--bg-raised)] p-5
                 transition-colors duration-[var(--duration-normal)]
                 hover:bg-[var(--surface-hover)]"
    >
      {/* Actions — appear on hover */}
      <div
        className="absolute right-3 top-3 flex gap-1 opacity-0
                   transition-opacity duration-[var(--duration-fast)]
                   group-hover:opacity-100"
      >
        <button
          type="button"
          onClick={onEdit}
          className="rounded-md px-2 py-1 text-xs text-[var(--text-secondary)]
                     transition-colors duration-[var(--duration-fast)]
                     hover:bg-[var(--surface-active)] hover:text-[var(--text-primary)]"
          aria-label={`${character.name} 수정`}
        >
          수정
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md px-2 py-1 text-xs text-[var(--text-tertiary)]
                     transition-colors duration-[var(--duration-fast)]
                     hover:bg-[var(--color-error-subtle-hover)] hover:text-[var(--color-error)]"
          aria-label={`${character.name} 삭제`}
        >
          삭제
        </button>
      </div>

      {/* Name + Role */}
      <div className="mb-2 flex items-center gap-2.5">
        <h4 className="text-display text-base font-semibold text-[var(--text-primary)]">
          {character.name}
        </h4>
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tint.bg} ${tint.text}`}
        >
          {character.role}
        </span>
      </div>

      {/* Description */}
      {character.description && (
        <p className="mb-1.5 line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">
          {character.description}
        </p>
      )}

      {/* Motivation */}
      {character.motivation && (
        <p className="text-xs leading-relaxed text-[var(--text-tertiary)]">
          <span className="font-medium">동기</span> &mdash; {character.motivation}
        </p>
      )}
    </div>
  );
}
