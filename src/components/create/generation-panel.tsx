'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useSynopsisStore } from '@/stores/synopsis-store';
import { useSynopsesStore } from '@/stores/synopses-store';
import { useSettingsStore } from '@/stores/settings-store';

export default function GenerationPanel() {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  // Aborts any in-flight streaming fetch on unmount / navigation
  const abortRef = useRef<AbortController | null>(null);

  const [hydrated, setHydrated] = useState(false);
  // Inline confirm for "다시 생성" — regenerate overwrites the current draft,
  // so we ask once before discarding it.
  const [confirmRegen, setConfirmRegen] = useState(false);

  useEffect(() => {
    useSynopsisStore.persist.rehydrate();
    useSynopsesStore.persist.rehydrate();
    useSettingsStore.persist.rehydrate();
    setHydrated(true);
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const title = useSynopsisStore((s) => s.title);
  const genre = useSynopsisStore((s) => s.genre);
  const tone = useSynopsisStore((s) => s.tone);
  const subject = useSynopsisStore((s) => s.subject);
  const targetAudience = useSynopsisStore((s) => s.targetAudience);
  const characters = useSynopsisStore((s) => s.characters);
  const keyEvents = useSynopsisStore((s) => s.keyEvents);
  const additionalNotes = useSynopsisStore((s) => s.additionalNotes);
  const isGenerating = useSynopsisStore((s) => s.isGenerating);
  const generatedContent = useSynopsisStore((s) => s.generatedContent);
  const generationError = useSynopsisStore((s) => s.generationError);
  const setGenerating = useSynopsisStore((s) => s.setGenerating);
  const setGeneratedContent = useSynopsisStore((s) => s.setGeneratedContent);
  const setGenerationError = useSynopsisStore((s) => s.setGenerationError);

  const addSynopsis = useSynopsesStore((s) => s.addSynopsis);

  const apiKey = useSettingsStore((s) => s.settings.apiKey);
  const promptTemplate = useSettingsStore((s) => s.settings.promptTemplate);

  // Validation
  const missingFields: string[] = [];
  if (!title.trim()) missingFields.push('제목');
  if (!genre) missingFields.push('장르');
  if (characters.length === 0) missingFields.push('등장인물 (최소 1명)');

  const canGenerate = missingFields.length === 0 && !isGenerating;

  // Auto-scroll as content streams in
  useEffect(() => {
    if (isGenerating && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [generatedContent, isGenerating]);

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;

    setGenerating(true);
    setGeneratedContent('');
    setGenerationError('');

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: {
            title,
            tone,
            genre,
            subject,
            targetAudience,
            characters,
            keyEvents,
            additionalNotes,
          },
          apiKey,
          promptTemplate,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error ?? `생성 요청 실패 (${response.status})`);
      }

      // Read streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('스트리밍 응답을 읽을 수 없습니다.');
      }

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setGeneratedContent(accumulated);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setGenerationError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setGenerating(false);
    }
  }, [
    canGenerate, title, tone, genre, subject, targetAudience,
    characters, keyEvents, additionalNotes, apiKey, promptTemplate,
    setGenerating, setGeneratedContent, setGenerationError,
  ]);

  const handleSave = useCallback(() => {
    if (!generatedContent) return;
    const now = new Date().toISOString();
    const id = uuidv4();
    addSynopsis({
      id,
      input: {
        title,
        tone,
        genre,
        subject,
        targetAudience,
        characters,
        keyEvents,
        additionalNotes,
      },
      content: generatedContent,
      createdAt: now,
      updatedAt: now,
      isFavorite: false,
    });
    // Peak-end: land on the work they just created, not a generic list.
    // ?new=1 triggers the premiere banner on the detail page.
    router.push(`/synopses/${id}?new=1`);
  }, [
    generatedContent, addSynopsis, router,
    title, tone, genre, subject, targetAudience,
    characters, keyEvents, additionalNotes,
  ]);

  const handleRegenerate = useCallback(() => {
    setConfirmRegen(false);
    setGeneratedContent('');
    setGenerationError('');
    // Delay slightly so state clears, then generate
    setTimeout(() => {
      handleGenerate();
    }, 50);
  }, [handleGenerate, setGeneratedContent, setGenerationError]);

  if (!hydrated) {
    return (
      <section className="animate-pulse">
        <div className="h-12 w-48 rounded-xl bg-[var(--bg-sunken)]" />
      </section>
    );
  }

  // Screen-reader status — announces generation lifecycle without cluttering the visible UI
  const liveMessage = isGenerating
    ? '시놉시스를 생성하고 있습니다.'
    : generatedContent
      ? '시놉시스 생성이 완료되었습니다.'
      : '';

  return (
    <section className="space-y-6">
      {/* Polite live region for assistive tech */}
      <div role="status" aria-live="polite" className="sr-only">
        {liveMessage}
      </div>

      {/* Validation message */}
      {missingFields.length > 0 && (
        <p className="text-sm text-[var(--text-tertiary)]">
          시놉시스를 완성하려면 다음이 필요해요: {missingFields.join(', ')}
        </p>
      )}

      {/* Generate button */}
      {!generatedContent && !isGenerating && (
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="w-full rounded-xl bg-[var(--color-brand)] px-6 py-4 text-lg
                     font-semibold text-white transition-all
                     duration-[var(--duration-normal)] ease-out-quart
                     hover:bg-[var(--color-brand-hover)] hover:shadow-md
                     active:scale-[0.98]
                     disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none
                     disabled:active:scale-100"
        >
          시놉시스 생성
        </button>
      )}

      {/* Generation error */}
      {generationError && (
        <div className="rounded-xl bg-[var(--color-error-subtle)] p-4">
          <p className="text-sm font-medium text-[var(--color-error)]">
            {generationError}
          </p>
          <button
            type="button"
            onClick={() => setGenerationError('')}
            className="mt-2 text-xs text-[var(--text-tertiary)] underline
                       transition-colors hover:text-[var(--text-secondary)]"
          >
            닫기
          </button>
        </div>
      )}

      {/* Streaming / result content */}
      {(isGenerating || generatedContent) && (
        <div className="space-y-4">
          <div
            ref={contentRef}
            className="max-h-[60vh] overflow-y-auto rounded-xl border border-[var(--border-default)]
                       bg-[var(--bg-raised)] p-6"
          >
            <div className="prose-sm whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-primary)]">
              {generatedContent}
            </div>

            {/* Typing indicator while streaming */}
            {isGenerating && (
              <span className="mt-1 inline-flex gap-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-brand)]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-brand)] [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-brand)] [animation-delay:300ms]" />
              </span>
            )}
          </div>

          {/* Post-generation actions */}
          {!isGenerating && generatedContent && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                className="rounded-xl bg-[var(--color-brand)] px-5 py-2.5 text-sm
                           font-semibold text-white transition-colors
                           duration-[var(--duration-normal)]
                           hover:bg-[var(--color-brand-hover)]"
              >
                저장하기
              </button>
              {confirmRegen ? (
                <div className="flex flex-wrap items-center gap-2 rounded-xl border
                                border-[var(--border-default)] bg-[var(--bg-raised)]
                                px-3 py-2 text-xs">
                  <span className="text-[var(--text-secondary)]">
                    지금 원고를 덮어쓸까요?
                  </span>
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    className="rounded-lg bg-[var(--color-brand)] px-2.5 py-1
                               text-xs font-medium text-white transition-colors
                               duration-[var(--duration-fast)]
                               hover:bg-[var(--color-brand-hover)]"
                  >
                    덮어쓰기
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmRegen(false)}
                    className="rounded-lg px-2 py-1 text-xs text-[var(--text-tertiary)]
                               transition-colors duration-[var(--duration-fast)]
                               hover:text-[var(--text-primary)]"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmRegen(true)}
                  className="rounded-xl border border-[var(--border-default)] px-5 py-2.5
                             text-sm font-medium text-[var(--text-secondary)]
                             transition-colors duration-[var(--duration-normal)]
                             hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                >
                  다시 생성
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
