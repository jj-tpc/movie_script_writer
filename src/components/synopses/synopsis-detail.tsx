'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Synopsis } from '@/types';
import { GENRES, TONES, AUDIENCES } from '@/lib/constants';

interface SynopsisDetailProps {
  synopsis: Synopsis;
  onToggleFavorite: () => void;
  onDelete: () => void;
}

function getGenreLabel(value: string): string {
  return GENRES.find((g) => g.value === value)?.label ?? value;
}

function getToneLabel(value: string): string {
  return TONES.find((t) => t.value === value)?.label ?? value;
}

function getAudienceLabel(value: string): string {
  return AUDIENCES.find((a) => a.value === value)?.label ?? value;
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

function CopyIcon() {
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
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
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
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ArrowLeftIcon() {
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
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function Ornament() {
  return (
    <svg width="36" height="8" viewBox="0 0 36 8" className="text-[var(--text-tertiary)]" aria-hidden="true">
      <circle cx="4" cy="4" r="1" fill="currentColor" />
      <line x1="9" y1="4" x2="16" y2="4" stroke="currentColor" strokeWidth="0.6" />
      <circle cx="18" cy="4" r="1.4" fill="currentColor" />
      <line x1="20" y1="4" x2="27" y2="4" stroke="currentColor" strokeWidth="0.6" />
      <circle cx="32" cy="4" r="1" fill="currentColor" />
    </svg>
  );
}

// Paper grain — subtle fractal noise layered under the page color.
// %23 escapes '#' inside the nested url() filter reference.
const PAPER_GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='7'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.055 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

export default function SynopsisDetail({
  synopsis,
  onToggleFavorite,
  onDelete,
}: SynopsisDetailProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);

  const { input, content, createdAt, updatedAt, isFavorite } = synopsis;

  const dateStr = new Date(createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const updatedStr = new Date(updatedAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const [srStatus, setSrStatus] = useState('');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setSrStatus('본문이 클립보드에 복사되었습니다.');
      setTimeout(() => {
        setCopied(false);
        setSrStatus('');
      }, 2000);
    } catch {
      setSrStatus('복사에 실패했습니다.');
    }
  };

  const sortedEvents = [...input.keyEvents].sort(
    (a, b) => a.sequence - b.sequence
  );

  // Split content into paragraphs for manuscript-style first-line indent
  const paragraphs = content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="relative mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6">
      {/* Polite live region — announces copy/delete without visual disruption */}
      <div role="status" aria-live="polite" className="sr-only">
        {srStatus}
      </div>

      {/* Back link — outside the paper, on the "desk" */}
      <Link
        href="/synopses"
        className="mb-8 inline-flex items-center gap-1.5 text-xs tracking-wide
                   text-[var(--text-secondary)] transition-colors
                   duration-[var(--duration-fast)]
                   hover:text-[var(--text-primary)]"
      >
        <ArrowLeftIcon />
        보관함으로 돌아가기
      </Link>

      {/* Paper sheet */}
      <article
        className="relative mx-auto w-full max-w-3xl border
                   transition-shadow duration-[var(--duration-slow)]"
        style={{
          backgroundImage: PAPER_GRAIN,
          backgroundColor: 'var(--paper-bg)',
          backgroundBlendMode: 'var(--paper-blend)' as React.CSSProperties['backgroundBlendMode'],
          borderColor: 'var(--paper-edge)',
          boxShadow: 'var(--paper-shadow)',
        }}
      >
        {/* Letterhead — top of the page */}
        <header
          className="flex flex-wrap items-center justify-between gap-3
                     border-b border-[var(--border-subtle)]
                     px-7 py-5 sm:px-12 sm:py-6"
        >
          <div className="flex items-center gap-3">
            <span
              className="text-display text-[9px] font-semibold tracking-[0.4em] uppercase
                         text-[var(--color-brand)]"
            >
              Manuscript
            </span>
            <span className="hidden h-px w-8 bg-[var(--border-default)] sm:block" />
            <span
              className="hidden text-display text-[10px] tracking-[0.2em] uppercase
                         text-[var(--text-tertiary)] sm:block"
            >
              시놉시스 원고
            </span>
          </div>
          <span
            className="text-display text-[10px] tracking-[0.2em] uppercase
                       text-[var(--text-tertiary)]"
          >
            {dateStr}
          </span>
        </header>

        {/* Title card */}
        <div className="px-7 pt-14 pb-12 text-center sm:px-12 sm:pt-20 sm:pb-14">
          <span
            className="text-display text-[10px] font-semibold tracking-[0.45em] uppercase
                       text-[var(--text-tertiary)]"
          >
            Synopsis
          </span>
          <h1
            className="text-display mt-5 text-[1.9rem] leading-[1.1] font-bold tracking-tight
                       text-[var(--text-primary)] sm:text-[2.6rem]"
          >
            {input.title || '제목 없음'}
          </h1>

          <div className="mt-8 flex items-center justify-center">
            <Ornament />
          </div>

          <dl
            className="mt-8 flex flex-wrap items-baseline justify-center
                       gap-x-8 gap-y-3"
          >
            {input.genre && (
              <div className="flex items-baseline gap-2">
                <dt className="text-display text-[9px] tracking-[0.35em] uppercase text-[var(--text-tertiary)]">
                  Genre
                </dt>
                <dd className="text-body text-sm text-[var(--text-primary)]">
                  {getGenreLabel(input.genre)}
                </dd>
              </div>
            )}
            {input.tone && (
              <div className="flex items-baseline gap-2">
                <dt className="text-display text-[9px] tracking-[0.35em] uppercase text-[var(--text-tertiary)]">
                  Tone
                </dt>
                <dd className="text-body text-sm text-[var(--text-primary)]">
                  {getToneLabel(input.tone)}
                </dd>
              </div>
            )}
            {input.targetAudience && (
              <div className="flex items-baseline gap-2">
                <dt className="text-display text-[9px] tracking-[0.35em] uppercase text-[var(--text-tertiary)]">
                  Rating
                </dt>
                <dd className="text-body text-sm text-[var(--text-primary)]">
                  {getAudienceLabel(input.targetAudience)}
                </dd>
              </div>
            )}
          </dl>

          {input.subject && (
            <p
              className="text-body mx-auto mt-8 max-w-[44ch] text-[15px] italic
                         leading-[1.8] text-[var(--text-secondary)]"
            >
              &ldquo;{input.subject}&rdquo;
            </p>
          )}
        </div>

        {/* Cast — dramatis personae */}
        {input.characters.length > 0 && (
          <section className="border-t border-[var(--border-subtle)] px-7 py-12 sm:px-14 sm:py-14">
            <div className="mb-10 flex items-baseline gap-4">
              <h2 className="text-display text-[11px] font-semibold tracking-[0.35em] uppercase text-[var(--color-brand)]">
                등장인물
              </h2>
              <span className="h-px flex-1 bg-[var(--border-subtle)]" />
              <span className="text-display text-[10px] tracking-[0.3em] uppercase text-[var(--text-tertiary)]">
                Dramatis Personae
              </span>
            </div>
            <dl className="divide-y divide-[var(--border-subtle)]">
              {input.characters.map((char) => (
                <div
                  key={char.id}
                  className="grid grid-cols-1 gap-x-10 gap-y-3 py-6
                             md:grid-cols-[170px_1fr]"
                >
                  <dt className="pt-0.5">
                    <div className="text-display text-[15px] font-semibold leading-tight tracking-wide text-[var(--text-primary)]">
                      {char.name}
                    </div>
                    <div className="mt-1.5 text-[11px] italic tracking-wider text-[var(--text-tertiary)]">
                      — {char.role}
                    </div>
                  </dt>
                  <dd className="text-body">
                    {char.description && (
                      <p className="text-[15px] leading-[1.85] text-[var(--text-secondary)]">
                        {char.description}
                      </p>
                    )}
                    {char.motivation && (
                      <p className="mt-3 text-[14px] italic leading-[1.7] text-[var(--text-tertiary)]">
                        <span className="text-display mr-2 text-[9px] not-italic tracking-[0.3em] uppercase text-[var(--color-brand)]">
                          욕망
                        </span>
                        {char.motivation}
                      </p>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Scene breakdown */}
        {sortedEvents.length > 0 && (
          <section className="border-t border-[var(--border-subtle)] px-7 py-12 sm:px-14 sm:py-14">
            <div className="mb-10 flex items-baseline gap-4">
              <h2 className="text-display text-[11px] font-semibold tracking-[0.35em] uppercase text-[var(--color-brand)]">
                주요 사건
              </h2>
              <span className="h-px flex-1 bg-[var(--border-subtle)]" />
              <span className="text-display text-[10px] tracking-[0.3em] uppercase text-[var(--text-tertiary)]">
                Scene Breakdown
              </span>
            </div>
            <ol className="flex flex-col gap-7">
              {sortedEvents.map((event, idx) => (
                <li
                  key={event.id}
                  className="grid grid-cols-[auto_1fr] gap-x-5"
                >
                  <span
                    className="text-display min-w-[2.75rem] pt-0.5 text-right text-[1.6rem]
                               font-light italic text-[var(--color-brand)]"
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="text-display text-[16px] font-semibold text-[var(--text-primary)]">
                        {event.title}
                      </h3>
                      <span className="text-display text-[10px] tracking-[0.3em] uppercase text-[var(--text-tertiary)]">
                        {event.type}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-body mt-2 text-[15px] leading-[1.85] text-[var(--text-secondary)]">
                        {event.description}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Synopsis body — manuscript text */}
        {paragraphs.length > 0 && (
          <section className="border-t border-[var(--border-subtle)] px-7 py-12 sm:px-14 sm:py-16">
            <div className="mb-10 flex items-baseline gap-4">
              <h2 className="text-display text-[11px] font-semibold tracking-[0.35em] uppercase text-[var(--color-brand)]">
                시놉시스
              </h2>
              <span className="h-px flex-1 bg-[var(--border-subtle)]" />
              <span className="text-display text-[10px] tracking-[0.3em] uppercase text-[var(--text-tertiary)]">
                Treatment
              </span>
            </div>
            <div className="text-body text-[16.5px] leading-[2] text-[var(--text-primary)]">
              {paragraphs.map((para, i) => (
                <p
                  key={i}
                  className={`whitespace-pre-wrap ${i === 0 ? '' : 'mt-5 indent-[1.5em]'}`}
                >
                  {para}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* Writer's notes — footnote style */}
        {input.additionalNotes && (
          <aside className="border-t border-[var(--border-subtle)] px-7 py-10 sm:px-14 sm:py-12">
            <div className="mb-4 flex items-baseline gap-3">
              <span className="text-display text-[10px] font-semibold tracking-[0.35em] uppercase text-[var(--text-tertiary)]">
                작가 노트
              </span>
              <span className="h-px flex-1 bg-[var(--border-subtle)]" />
            </div>
            <p className="text-body whitespace-pre-wrap text-[14px] italic leading-[1.9] text-[var(--text-tertiary)]">
              {input.additionalNotes}
            </p>
          </aside>
        )}

        {/* Page end — FIN */}
        <footer className="flex flex-col items-center gap-3 border-t border-[var(--border-subtle)] px-7 py-12 sm:px-14 sm:py-14">
          <div className="flex items-center gap-4">
            <span className="h-px w-12 bg-[var(--border-default)]" />
            <span className="text-display text-[11px] font-semibold tracking-[0.5em] uppercase text-[var(--text-tertiary)]">
              Fin
            </span>
            <span className="h-px w-12 bg-[var(--border-default)]" />
          </div>
          {createdAt !== updatedAt && (
            <span className="text-display mt-2 text-[10px] tracking-[0.25em] uppercase text-[var(--text-tertiary)]">
              Revised · {updatedStr}
            </span>
          )}
        </footer>
      </article>

      {/* Action tray — below the paper, on the desk */}
      <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-2">
        {/* Favorite */}
        <button
          onClick={onToggleFavorite}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs
                     tracking-wide transition-colors duration-[var(--duration-fast)]
                     ${
                       isFavorite
                         ? 'bg-[var(--color-brand-subtle)] font-medium text-[var(--color-brand-on-subtle)]'
                         : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--color-brand)]'
                     }`}
          type="button"
          aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기에 추가'}
        >
          <HeartIcon filled={isFavorite} />
          {isFavorite ? '즐겨찾기 해제' : '즐겨찾기'}
        </button>

        {/* Copy */}
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs
                     tracking-wide text-[var(--text-secondary)] transition-colors
                     duration-[var(--duration-fast)]
                     hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
          type="button"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? '복사됨' : '본문 복사'}
        </button>

        {/* New version */}
        <Link
          href="/create"
          className="inline-flex items-center rounded-full px-4 py-2 text-xs
                     tracking-wide text-[var(--text-secondary)] transition-colors
                     duration-[var(--duration-fast)]
                     hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
        >
          새 원고 작성
        </Link>

        {/* Spacer */}
        <span className="mx-2 hidden h-4 w-px bg-[var(--border-default)] sm:block" />

        {/* Delete */}
        {confirmDelete ? (
          <div className="flex flex-wrap items-center gap-2 rounded-full border border-[var(--color-error)] bg-[var(--bg-raised)] px-3 py-1.5">
            <span className="text-[11px] tracking-wide text-[var(--color-error)]">
              이 작품을 삭제할까요? · 되돌릴 수 없습니다
            </span>
            <button
              onClick={() => { setSrStatus('시놉시스를 삭제했습니다.'); onDelete(); }}
              className="rounded-full bg-[var(--color-error)] px-2.5 py-0.5 text-[11px]
                         font-medium text-white transition-opacity hover:opacity-90"
              type="button"
            >
              확인
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="rounded-full px-2 py-0.5 text-[11px] text-[var(--text-secondary)]
                         transition-colors hover:text-[var(--text-primary)]"
              type="button"
            >
              취소
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center rounded-full px-4 py-2 text-xs
                       tracking-wide text-[var(--text-tertiary)] transition-colors
                       duration-[var(--duration-fast)]
                       hover:bg-[var(--surface-hover)] hover:text-[var(--color-error)]"
            type="button"
          >
            삭제
          </button>
        )}
      </div>
    </div>
  );
}
