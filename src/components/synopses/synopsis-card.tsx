'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Synopsis } from '@/types';
import { GENRES, TONES } from '@/lib/constants';

interface SynopsisCardProps {
  synopsis: Synopsis;
  onToggleFavorite: () => void;
  onDelete: () => void;
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function getGenreLabel(value: string): string {
  return GENRES.find((g) => g.value === value)?.label ?? value;
}

function getToneLabel(value: string): string {
  return TONES.find((t) => t.value === value)?.label ?? value;
}

export default function SynopsisCard({
  synopsis,
  onToggleFavorite,
  onDelete,
}: SynopsisCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { input, content, createdAt, isFavorite } = synopsis;
  const dateStr = new Date(createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const preview = content.length > 120 ? content.slice(0, 120) + '...' : content;

  return (
    <article
      className="group relative flex flex-col rounded-lg border border-[var(--border-default)]
                 bg-[var(--bg-raised)] transition-colors duration-[var(--duration-normal)]
                 hover:border-[var(--color-brand-light)]"
    >
      {/* Clickable area */}
      <Link
        href={`/synopses/${synopsis.id}`}
        className="flex flex-1 flex-col gap-3 px-5 pt-5 pb-3"
      >
        {/* Header row: title + favorite */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-display text-base font-semibold leading-snug text-[var(--text-primary)]">
            {input.title}
          </h3>
        </div>

        {/* Labels */}
        <div className="flex flex-wrap items-center gap-2">
          {input.genre && (
            <span className="rounded-full bg-[var(--color-brand-subtle)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-brand-on-subtle)]">
              {getGenreLabel(input.genre)}
            </span>
          )}
          {input.tone && (
            <span className="rounded-full bg-[var(--bg-sunken)] px-2.5 py-0.5 text-xs text-[var(--text-secondary)]">
              {getToneLabel(input.tone)}
            </span>
          )}
        </div>

        {/* Preview */}
        <p className="text-body text-sm leading-relaxed text-[var(--text-secondary)]">
          {preview}
        </p>

        {/* Date */}
        <time className="mt-auto pt-1 text-xs text-[var(--text-tertiary)]">
          {dateStr}
        </time>
      </Link>

      {/* Action bar */}
      <div className="flex items-center justify-between border-t border-[var(--border-subtle)] px-4 py-2">
        {/* Favorite toggle */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite();
          }}
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors
                     duration-[var(--duration-fast)]
                     ${
                       isFavorite
                         ? 'text-[var(--color-brand)]'
                         : 'text-[var(--text-tertiary)] hover:text-[var(--color-brand)]'
                     }`}
          aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          type="button"
        >
          <HeartIcon filled={isFavorite} />
        </button>

        {/* Delete */}
        {confirmDelete ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[var(--color-error)]">이 작품을 삭제할까요?</span>
            <button
              onClick={(e) => {
                e.preventDefault();
                onDelete();
              }}
              className="rounded px-2 py-0.5 font-medium text-[var(--color-error)] transition-colors
                         hover:bg-[var(--color-error)] hover:text-white"
              type="button"
            >
              확인
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setConfirmDelete(false);
              }}
              className="rounded px-2 py-0.5 text-[var(--text-tertiary)] transition-colors
                         hover:text-[var(--text-primary)]"
              type="button"
            >
              취소
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.preventDefault();
              setConfirmDelete(true);
            }}
            className="flex items-center rounded-md px-2 py-1 text-[var(--text-tertiary)]
                       opacity-0 transition-all duration-[var(--duration-fast)]
                       group-hover:opacity-100 hover:text-[var(--color-error)]"
            aria-label="삭제"
            type="button"
          >
            <TrashIcon />
          </button>
        )}
      </div>
    </article>
  );
}
