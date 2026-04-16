'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSynopsisStore } from '@/stores/synopsis-store';
import { useSettingsStore } from '@/stores/settings-store';
import type { KeyEvent, EventType } from '@/types';
import { EVENT_TYPES } from '@/lib/constants';
import { extractStreamedObjects } from '@/lib/stream-json';
import EventCard from './event-card';
import EventDialog from './event-dialog';

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
    </svg>
  );
}

export default function EventSection() {
  const [hydrated, setHydrated] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  // Short-lived "N개 장면 추가 완료" flash after AI writes new beats
  const [lastAiAdded, setLastAiAdded] = useState(0);
  // IDs of events added during the current AI pass — get scene-in animation.
  const [streamingIds, setStreamingIds] = useState<Set<string>>(new Set());

  // Aborts any in-flight AI fetch when the component unmounts
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    useSynopsisStore.persist.rehydrate();
    useSettingsStore.persist.rehydrate();
    setHydrated(true);
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // Auto-clear the scene-added flash after 5s
  useEffect(() => {
    if (lastAiAdded <= 0) return;
    const t = window.setTimeout(() => setLastAiAdded(0), 5000);
    return () => window.clearTimeout(t);
  }, [lastAiAdded]);

  const title = useSynopsisStore((s) => s.title);
  const genre = useSynopsisStore((s) => s.genre);
  const tone = useSynopsisStore((s) => s.tone);
  const subject = useSynopsisStore((s) => s.subject);
  const targetAudience = useSynopsisStore((s) => s.targetAudience);
  const additionalNotes = useSynopsisStore((s) => s.additionalNotes);
  const characters = useSynopsisStore((s) => s.characters);
  const keyEvents = useSynopsisStore((s) => s.keyEvents);
  const addEvent = useSynopsisStore((s) => s.addEvent);
  const updateEvent = useSynopsisStore((s) => s.updateEvent);
  const removeEvent = useSynopsisStore((s) => s.removeEvent);
  const reorderEvents = useSynopsisStore((s) => s.reorderEvents);

  const apiKey = useSettingsStore((s) => s.settings.apiKey);
  const eventPromptTemplate = useSettingsStore((s) => s.settings.eventPromptTemplate);

  const [dialogState, setDialogState] = useState<null | 'new' | string>(null);

  const sortedEvents = [...keyEvents].sort((a, b) => a.sequence - b.sequence);
  const nextSequence = keyEvents.length > 0 ? Math.max(...keyEvents.map((e) => e.sequence)) + 1 : 1;

  const handleAdd = useCallback(() => setDialogState('new'), []);
  const handleEdit = useCallback((id: string) => setDialogState(id), []);
  const handleCancel = useCallback(() => setDialogState(null), []);

  const handleSaveNew = useCallback(
    (evt: KeyEvent) => { addEvent(evt); setDialogState(null); },
    [addEvent],
  );
  const handleSaveEdit = useCallback(
    (evt: KeyEvent) => { updateEvent(evt.id, evt); setDialogState(null); },
    [updateEvent],
  );
  const handleRemove = useCallback(
    (id: string) => { removeEvent(id); if (dialogState === id) setDialogState(null); },
    [removeEvent, dialogState],
  );

  const handleMoveUp = useCallback(
    (index: number) => {
      if (index <= 0) return;
      const reordered = [...sortedEvents];
      const tempSeq = reordered[index].sequence;
      reordered[index] = { ...reordered[index], sequence: reordered[index - 1].sequence };
      reordered[index - 1] = { ...reordered[index - 1], sequence: tempSeq };
      reorderEvents(reordered);
    },
    [sortedEvents, reorderEvents],
  );

  const handleMoveDown = useCallback(
    (index: number) => {
      if (index >= sortedEvents.length - 1) return;
      const reordered = [...sortedEvents];
      const tempSeq = reordered[index].sequence;
      reordered[index] = { ...reordered[index], sequence: reordered[index + 1].sequence };
      reordered[index + 1] = { ...reordered[index + 1], sequence: tempSeq };
      reorderEvents(reordered);
    },
    [sortedEvents, reorderEvents],
  );

  const canAiGenerate = !!title.trim() && !!genre && characters.length > 0 && !isAiGenerating;

  const handleAiGenerate = useCallback(async () => {
    if (!canAiGenerate) return;
    setIsAiGenerating(true);
    setAiError('');
    setStreamingIds(new Set());

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { title, tone, genre, subject, targetAudience, characters, keyEvents: [], additionalNotes },
          apiKey,
          promptTemplate: eventPromptTemplate,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error ?? `요청 실패 (${response.status})`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('응답을 읽을 수 없습니다.');

      const decoder = new TextDecoder();
      let accumulated = '';
      let cursor = 0;
      let seq = nextSequence;
      let added = 0;

      // Each beat materializes the moment its object closes in the stream.
      const flush = (items: Array<{ title: string; type: string; description: string }>) => {
        for (const e of items) {
          const eventType = EVENT_TYPES.includes(e.type as EventType)
            ? (e.type as EventType)
            : '전개';
          const id = uuidv4();
          addEvent({
            id,
            title: e.title || '제목 없음',
            type: eventType,
            description: e.description || '',
            sequence: seq++,
          });
          setStreamingIds((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
          });
          added++;
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        const out = extractStreamedObjects<{
          title: string; type: string; description: string;
        }>(accumulated, cursor);
        cursor = out.cursor;
        flush(out.items);
      }

      // Final sweep for trailing objects.
      const final = extractStreamedObjects<{
        title: string; type: string; description: string;
      }>(accumulated, cursor);
      flush(final.items);

      if (added > 0) setLastAiAdded(added);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setAiError(err instanceof Error ? err.message : '사건 생성 중 오류가 발생했습니다.');
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setIsAiGenerating(false);
    }
  }, [canAiGenerate, title, tone, genre, subject, targetAudience, characters, additionalNotes, apiKey, eventPromptTemplate, addEvent, nextSequence]);

  if (!hydrated) {
    return (
      <section className="space-y-4 animate-pulse">
        <div className="h-8 w-40 rounded-lg bg-[var(--bg-sunken)]" />
        <div className="h-24 rounded-xl bg-[var(--bg-sunken)]" />
      </section>
    );
  }

  return (
    <section>
      {/* Header — cinema overline, Korean title, director's note */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-display mb-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-tertiary)]">
            Scene 03 · Beats
          </p>
          <h3 className="text-display text-xl font-semibold text-[var(--text-primary)]">
            주요 사건
          </h3>
          <p className="text-body mt-1 text-xs italic leading-relaxed text-[var(--text-tertiary)]">
            이야기가 흐르는 골격, 장면의 연쇄를 세웁니다.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handleAiGenerate}
            disabled={!canAiGenerate}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--color-brand-subtle)]
                       px-3 py-1.5 text-sm font-medium text-[var(--color-brand-on-subtle)]
                       transition-colors duration-[var(--duration-normal)]
                       hover:bg-[var(--color-brand-light)]
                       disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isAiGenerating ? (
              <span className="inline-flex gap-0.5">
                <span className="h-1 w-1 animate-pulse rounded-full bg-current" />
                <span className="h-1 w-1 animate-pulse rounded-full bg-current [animation-delay:150ms]" />
                <span className="h-1 w-1 animate-pulse rounded-full bg-current [animation-delay:300ms]" />
              </span>
            ) : (
              <SparkleIcon />
            )}
            AI로 생성
          </button>
          <button
            type="button"
            onClick={handleAdd}
            disabled={dialogState === 'new'}
            className="rounded-lg bg-[var(--bg-sunken)] px-3.5 py-1.5 text-sm font-medium
                       text-[var(--text-secondary)] transition-colors
                       duration-[var(--duration-normal)]
                       hover:bg-[var(--surface-active)] hover:text-[var(--text-primary)]
                       disabled:cursor-not-allowed disabled:opacity-40"
          >
            + 직접 추가
          </button>
        </div>
      </div>

      {/* AI scene-added success flash — auto-clears after 5s */}
      {lastAiAdded > 0 && !aiError && (
        <p
          role="status"
          aria-live="polite"
          className="text-body mb-4 flex items-baseline gap-2 text-xs italic text-[var(--color-brand-on-subtle)]"
        >
          <span aria-hidden="true" className="not-italic">✦</span>
          <span>
            <span className="font-semibold not-italic">{lastAiAdded}개 장면이 대본에 들어왔습니다</span>
            <span className="ml-1.5 text-[var(--text-tertiary)]">
              · 순서와 흐름을 다시 살펴보세요.
            </span>
          </span>
        </p>
      )}

      {/* AI error */}
      {aiError && (
        <div className="mb-4 rounded-lg bg-[var(--color-error-subtle)] px-4 py-3">
          <p className="text-sm text-[var(--color-error)]">{aiError}</p>
          <button type="button" onClick={() => setAiError('')}
            className="mt-1 text-xs text-[var(--text-tertiary)] underline hover:text-[var(--text-secondary)]">
            닫기
          </button>
        </div>
      )}

      {/* AI generation hint */}
      {!canAiGenerate && !isAiGenerating && keyEvents.length === 0 && (
        <p className="mb-3 text-xs text-[var(--text-tertiary)]">
          AI로 장면을 세우려면 제목, 장르, 그리고 등장인물 한 명이 필요해요.
        </p>
      )}

      {/* Add dialog */}
      <div
        className="grid transition-all duration-[var(--duration-slow)] ease-out-quart"
        style={{ gridTemplateRows: dialogState === 'new' ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          {dialogState === 'new' && (
            <div className="pb-4">
              <EventDialog nextSequence={nextSequence} onSave={handleSaveNew} onCancel={handleCancel} />
            </div>
          )}
        </div>
      </div>

      {/* Event list */}
      {sortedEvents.length === 0 && dialogState !== 'new' ? (
        <p className="rounded-xl border border-dashed border-[var(--border-default)]
                      px-6 py-8 text-center text-sm text-[var(--text-tertiary)]">
          아직 사건이 없습니다. AI로 생성하거나 직접 추가해보세요.
        </p>
      ) : (
        <div className="space-y-3">
          {sortedEvents.map((evt, index) => {
            const isEditing = dialogState === evt.id;
            const isStreaming = streamingIds.has(evt.id);
            return (
              <div key={evt.id} className={isStreaming ? 'scene-in' : undefined}>
                <div
                  className="grid transition-all duration-[var(--duration-slow)] ease-out-quart"
                  style={{ gridTemplateRows: isEditing ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    {isEditing && (
                      <div className="pb-3">
                        <EventDialog event={evt} nextSequence={nextSequence} onSave={handleSaveEdit} onCancel={handleCancel} />
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className="grid transition-all duration-[var(--duration-slow)] ease-out-quart"
                  style={{ gridTemplateRows: isEditing ? '0fr' : '1fr' }}
                >
                  <div className="overflow-hidden">
                    {!isEditing && (
                      <div className="flex items-start gap-2">
                        <div className="flex shrink-0 flex-col gap-1 pt-2">
                          <button type="button" onClick={() => handleMoveUp(index)} disabled={index === 0}
                            className="flex h-11 w-11 items-center justify-center rounded-md text-[var(--text-tertiary)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-secondary)] disabled:invisible"
                            aria-label="위로 이동">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
                          </button>
                          <button type="button" onClick={() => handleMoveDown(index)} disabled={index === sortedEvents.length - 1}
                            className="flex h-11 w-11 items-center justify-center rounded-md text-[var(--text-tertiary)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-secondary)] disabled:invisible"
                            aria-label="아래로 이동">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                          </button>
                        </div>
                        <div className="min-w-0 flex-1">
                          <EventCard event={evt} onEdit={() => handleEdit(evt.id)} onRemove={() => handleRemove(evt.id)} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
