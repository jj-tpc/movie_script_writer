'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSynopsisStore } from '@/stores/synopsis-store';
import { GENRES, TONES, AUDIENCES } from '@/lib/constants';

/**
 * Progressive disclosure — shrink the decision surface from 22 chips
 * to 12 upfront (6 genres + 6 tones), with the rarer options folded
 * behind a "더 보기" reveal. The split is editorial, not alphabetical:
 * the 6 most-requested Korean film genres and tones stay visible;
 * specialty ones hide until asked for.
 */
const PRIMARY_GENRE_VALUES = new Set([
  'drama',
  'romance',
  'thriller',
  'action',
  'comedy',
  'mystery',
]);
const PRIMARY_TONE_VALUES = new Set([
  'emotional',
  'tense',
  'romantic',
  'dark',
  'hopeful',
  'humorous',
]);

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-[var(--duration-normal)] ease-out-quart ${
        open ? 'rotate-180' : ''
      }`}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function BasicInfoSection() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    useSynopsisStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  const title = useSynopsisStore((s) => s.title);
  const genre = useSynopsisStore((s) => s.genre);
  const tone = useSynopsisStore((s) => s.tone);
  const targetAudience = useSynopsisStore((s) => s.targetAudience);
  const subject = useSynopsisStore((s) => s.subject);
  const additionalNotes = useSynopsisStore((s) => s.additionalNotes);

  const setTitle = useSynopsisStore((s) => s.setTitle);
  const setGenre = useSynopsisStore((s) => s.setGenre);
  const setTone = useSynopsisStore((s) => s.setTone);
  const setTargetAudience = useSynopsisStore((s) => s.setTargetAudience);
  const setSubject = useSynopsisStore((s) => s.setSubject);
  const setAdditionalNotes = useSynopsisStore((s) => s.setAdditionalNotes);

  // Split chip sets. Memoized so identity is stable across renders.
  const { primaryGenres, secondaryGenres } = useMemo(() => {
    return {
      primaryGenres: GENRES.filter((g) => PRIMARY_GENRE_VALUES.has(g.value)),
      secondaryGenres: GENRES.filter((g) => !PRIMARY_GENRE_VALUES.has(g.value)),
    };
  }, []);
  const { primaryTones, secondaryTones } = useMemo(() => {
    return {
      primaryTones: TONES.filter((t) => PRIMARY_TONE_VALUES.has(t.value)),
      secondaryTones: TONES.filter((t) => !PRIMARY_TONE_VALUES.has(t.value)),
    };
  }, []);

  // Auto-expand when the persisted selection lives in the secondary set —
  // otherwise the user can't see what they picked on reload.
  const genreInSecondary = !!genre && !PRIMARY_GENRE_VALUES.has(genre);
  const toneInSecondary = !!tone && !PRIMARY_TONE_VALUES.has(tone);
  const [genreOpen, setGenreOpen] = useState(false);
  const [toneOpen, setToneOpen] = useState(false);
  useEffect(() => {
    if (genreInSecondary) setGenreOpen(true);
  }, [genreInSecondary]);
  useEffect(() => {
    if (toneInSecondary) setToneOpen(true);
  }, [toneInSecondary]);

  if (!hydrated) {
    return (
      <section className="space-y-8 animate-pulse">
        <div className="h-16 rounded-t-xl bg-[var(--bg-sunken)]" />
        <div className="h-64 rounded-b-xl bg-[var(--bg-sunken)]" />
      </section>
    );
  }

  return (
    /**
     * Production slate — clapperboard-style card.
     * Hinge stripe on top, metadata bar with scene/take, then the
     * actual fields live inside the slate body. Not a generic form card.
     */
    <section
      aria-labelledby="slate-title"
      className="overflow-hidden rounded-xl border border-[var(--border-default)]
                 bg-[var(--bg-raised)] shadow-[0_1px_0_0_var(--border-subtle)]"
    >
      {/* Clapperboard sticks — bold diagonal stripe band (black/cream) */}
      <div
        aria-hidden="true"
        className="h-4"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-45deg, var(--text-primary) 0 12px, var(--bg-raised) 12px 24px)',
        }}
      />
      {/* Accent band — the color stripe along the slate's hinge */}
      <div
        aria-hidden="true"
        className="h-1 bg-[var(--color-brand)]"
      />

      {/* Slate metadata strip — scene number dominates */}
      <div
        className="flex items-end justify-between gap-4 border-b
                   border-[var(--border-default)] bg-[var(--bg-sunken)]
                   px-5 py-4 sm:px-7 sm:py-5"
      >
        {/* Left — SCENE block with oversized number */}
        <div className="flex items-end gap-4 sm:gap-5">
          <div className="flex flex-col">
            <span className="text-display text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-tertiary)]">
              Scene
            </span>
            <span className="text-display text-3xl font-black leading-none tracking-tight tabular-nums text-[var(--text-primary)] sm:text-4xl">
              01
            </span>
          </div>
          <span
            aria-hidden="true"
            className="mb-1 hidden h-8 w-px bg-[var(--border-default)] sm:block"
          />
          <span className="text-display mb-0.5 hidden text-[10px] font-bold uppercase leading-[1.4] tracking-[0.28em] text-[var(--text-tertiary)] sm:inline">
            Production<br />Slate
          </span>
        </div>

        {/* Right — TAKE stack */}
        <div className="flex flex-col items-end">
          <span className="text-display text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-tertiary)]">
            Take
          </span>
          <span className="text-display text-2xl font-black leading-none tabular-nums text-[var(--text-secondary)] sm:text-3xl">
            01
          </span>
        </div>
      </div>

      {/* Slate body — fields live here */}
      <div className="space-y-10 px-5 py-7 sm:px-7 sm:py-9">
        {/* Section intro — overline + Korean header */}
        <div>
          <p className="text-display mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--text-tertiary)]">
            Working Title
          </p>
          <label htmlFor="synopsis-title" className="sr-only">
            작품 제목
          </label>
          <input
            id="synopsis-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="작품 제목을 입력하세요"
            className="text-display w-full border-0 border-b-2 border-[var(--border-subtle)]
                       bg-transparent pb-3 text-3xl font-semibold tracking-tight
                       text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]
                       transition-colors duration-[var(--duration-normal)]
                       focus:border-[var(--color-brand)] focus:outline-none"
          />
          <h2 id="slate-title" className="sr-only">
            기본 정보 슬레이트
          </h2>
        </div>

        {/* Genre + Tone — mood board style, side by side on larger screens */}
        <div className="grid gap-8 sm:grid-cols-2">
          {/* Genre */}
          <fieldset>
            <legend className="text-display mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--text-tertiary)]">
              Genre · 장르
            </legend>
            <div className="flex flex-wrap gap-2">
              {primaryGenres.map((g) => {
                const selected = genre === g.value;
                return (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGenre(selected ? '' : g.value)}
                    aria-pressed={selected}
                    className={`rounded-full px-4 py-1.5 text-sm transition-all
                               duration-[var(--duration-normal)] ease-out-quart
                               ${
                                 selected
                                   ? 'bg-[var(--color-brand)] text-white font-medium shadow-sm'
                                   : 'bg-[var(--bg-sunken)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                               }`}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
            {/* Secondary genre reveal */}
            <div
              id="genre-secondary"
              className="grid transition-all duration-[var(--duration-slow)] ease-out-quart"
              style={{ gridTemplateRows: genreOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <div className="flex flex-wrap gap-2 pt-2">
                  {secondaryGenres.map((g) => {
                    const selected = genre === g.value;
                    return (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => setGenre(selected ? '' : g.value)}
                        aria-pressed={selected}
                        tabIndex={genreOpen ? 0 : -1}
                        className={`rounded-full px-4 py-1.5 text-sm transition-all
                                   duration-[var(--duration-normal)] ease-out-quart
                                   ${
                                     selected
                                       ? 'bg-[var(--color-brand)] text-white font-medium shadow-sm'
                                       : 'bg-[var(--bg-sunken)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                                   }`}
                      >
                        {g.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setGenreOpen((v) => !v)}
              aria-expanded={genreOpen}
              aria-controls="genre-secondary"
              className="mt-3 inline-flex items-center gap-1.5 text-xs
                         text-[var(--text-tertiary)]
                         transition-colors duration-[var(--duration-normal)]
                         hover:text-[var(--text-secondary)]"
            >
              <ChevronIcon open={genreOpen} />
              {genreOpen
                ? '접기'
                : `다른 장르 ${secondaryGenres.length}개 더`}
            </button>
          </fieldset>

          {/* Tone */}
          <fieldset>
            <legend className="text-display mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--text-tertiary)]">
              Tone · 톤
            </legend>
            <div className="flex flex-wrap gap-2">
              {primaryTones.map((t) => {
                const selected = tone === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTone(selected ? '' : t.value)}
                    aria-pressed={selected}
                    className={`rounded-full px-4 py-1.5 text-sm transition-all
                               duration-[var(--duration-normal)] ease-out-quart
                               ${
                                 selected
                                   ? 'bg-[var(--color-brand)] text-white font-medium shadow-sm'
                                   : 'bg-[var(--bg-sunken)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                               }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
            {/* Secondary tone reveal */}
            <div
              id="tone-secondary"
              className="grid transition-all duration-[var(--duration-slow)] ease-out-quart"
              style={{ gridTemplateRows: toneOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <div className="flex flex-wrap gap-2 pt-2">
                  {secondaryTones.map((t) => {
                    const selected = tone === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setTone(selected ? '' : t.value)}
                        aria-pressed={selected}
                        tabIndex={toneOpen ? 0 : -1}
                        className={`rounded-full px-4 py-1.5 text-sm transition-all
                                   duration-[var(--duration-normal)] ease-out-quart
                                   ${
                                     selected
                                       ? 'bg-[var(--color-brand)] text-white font-medium shadow-sm'
                                       : 'bg-[var(--bg-sunken)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                                   }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setToneOpen((v) => !v)}
              aria-expanded={toneOpen}
              aria-controls="tone-secondary"
              className="mt-3 inline-flex items-center gap-1.5 text-xs
                         text-[var(--text-tertiary)]
                         transition-colors duration-[var(--duration-normal)]
                         hover:text-[var(--text-secondary)]"
            >
              <ChevronIcon open={toneOpen} />
              {toneOpen
                ? '접기'
                : `다른 톤 ${secondaryTones.length}개 더`}
            </button>
          </fieldset>
        </div>

        {/* Target Audience */}
        <fieldset>
          <legend className="text-display mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--text-tertiary)]">
            Rating · 관람 등급
          </legend>
          <div className="flex flex-wrap gap-2">
            {AUDIENCES.map((a) => {
              const selected = targetAudience === a.value;
              return (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setTargetAudience(selected ? '' : a.value)}
                  aria-pressed={selected}
                  className={`rounded-full px-4 py-1.5 text-sm transition-all
                             duration-[var(--duration-normal)] ease-out-quart
                             ${
                               selected
                                 ? 'bg-[var(--color-brand)] text-white font-medium shadow-sm'
                                 : 'bg-[var(--bg-sunken)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                             }`}
                >
                  {a.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Subject + Additional Notes — stacked */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="subject"
              className="text-display mb-2 block text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--text-tertiary)]"
            >
              Logline · 주제
            </label>
            <textarea
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="이 작품이 탐구하는 주제는 무엇인가요?"
              rows={3}
              className="w-full resize-none rounded-lg border border-[var(--border-default)]
                         bg-[var(--bg-base)] px-4 py-3 text-sm text-[var(--text-primary)]
                         placeholder:text-[var(--text-tertiary)]
                         transition-colors duration-[var(--duration-normal)]
                         focus:border-[var(--color-brand)] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="additionalNotes"
              className="text-display mb-2 block text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--text-tertiary)]"
            >
              Notes · 참고
              <span className="ml-1.5 text-[var(--text-tertiary)] normal-case tracking-normal">
                (선택)
              </span>
            </label>
            <textarea
              id="additionalNotes"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="감독의 메모, 레퍼런스, 분위기 키워드 등"
              rows={3}
              className="w-full resize-none rounded-lg border border-[var(--border-default)]
                         bg-[var(--bg-base)] px-4 py-3 text-sm text-[var(--text-primary)]
                         placeholder:text-[var(--text-tertiary)]
                         transition-colors duration-[var(--duration-normal)]
                         focus:border-[var(--color-brand)] focus:outline-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
