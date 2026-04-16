'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSynopsisStore } from '@/stores/synopsis-store';
import { useSettingsStore } from '@/stores/settings-store';
import type { Character, CharacterRole } from '@/types';
import { CHARACTER_ROLES } from '@/lib/constants';
import { extractStreamedObjects } from '@/lib/stream-json';
import CharacterCard from './character-card';
import CharacterDialog from './character-dialog';

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
    </svg>
  );
}

export default function CharacterSection() {
  const [hydrated, setHydrated] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  // Short-lived "N명 섭외 완료" flash after AI casts new characters
  const [lastAiAdded, setLastAiAdded] = useState(0);
  // IDs of characters added during the current AI pass — they get the
  // scene-in entrance animation. Cleared when the next pass starts.
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

  // Auto-clear the "섭외 완료" flash after 5s so it doesn't linger
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
  const addCharacter = useSynopsisStore((s) => s.addCharacter);
  const updateCharacter = useSynopsisStore((s) => s.updateCharacter);
  const removeCharacter = useSynopsisStore((s) => s.removeCharacter);

  const apiKey = useSettingsStore((s) => s.settings.apiKey);
  const characterPromptTemplate = useSettingsStore((s) => s.settings.characterPromptTemplate);

  const [dialogState, setDialogState] = useState<null | 'new' | string>(null);

  const handleAdd = useCallback(() => setDialogState('new'), []);
  const handleEdit = useCallback((id: string) => setDialogState(id), []);
  const handleCancel = useCallback(() => setDialogState(null), []);

  const handleSaveNew = useCallback(
    (char: Character) => { addCharacter(char); setDialogState(null); },
    [addCharacter],
  );
  const handleSaveEdit = useCallback(
    (char: Character) => { updateCharacter(char.id, char); setDialogState(null); },
    [updateCharacter],
  );
  const handleRemove = useCallback(
    (id: string) => { removeCharacter(id); if (dialogState === id) setDialogState(null); },
    [removeCharacter, dialogState],
  );

  const canAiGenerate = !!title.trim() && !!genre && !isAiGenerating;

  const handleAiGenerate = useCallback(async () => {
    if (!canAiGenerate) return;
    setIsAiGenerating(true);
    setAiError('');
    // New run — reset the set of actively-animating entries
    setStreamingIds(new Set());

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { title, tone, genre, subject, targetAudience, characters: [], keyEvents: [], additionalNotes },
          apiKey,
          promptTemplate: characterPromptTemplate,
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
      let added = 0;

      // As chunks arrive, extract any newly-complete objects and add them
      // to the store immediately. The user sees each character appear the
      // moment the model finishes writing it, rather than after the full
      // array closes.
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });

        const out = extractStreamedObjects<{
          name: string; role: string; description: string; motivation: string;
        }>(accumulated, cursor);
        cursor = out.cursor;
        for (const c of out.items) {
          const role = CHARACTER_ROLES.includes(c.role as CharacterRole)
            ? (c.role as CharacterRole)
            : '기타';
          const id = uuidv4();
          addCharacter({
            id,
            name: c.name || '이름 없음',
            role,
            description: c.description || '',
            motivation: c.motivation || '',
          });
          setStreamingIds((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
          });
          added++;
        }
      }

      // Final sweep — flush any trailing objects not yet seen (in case the
      // last chunk closed an object exactly at the boundary).
      const final = extractStreamedObjects<{
        name: string; role: string; description: string; motivation: string;
      }>(accumulated, cursor);
      for (const c of final.items) {
        const role = CHARACTER_ROLES.includes(c.role as CharacterRole)
          ? (c.role as CharacterRole)
          : '기타';
        const id = uuidv4();
        addCharacter({
          id,
          name: c.name || '이름 없음',
          role,
          description: c.description || '',
          motivation: c.motivation || '',
        });
        setStreamingIds((prev) => {
          const next = new Set(prev);
          next.add(id);
          return next;
        });
        added++;
      }

      if (added > 0) setLastAiAdded(added);
    } catch (err) {
      // Ignore abort errors — they're intentional (navigation / unmount)
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setAiError(err instanceof Error ? err.message : '캐릭터 생성 중 오류가 발생했습니다.');
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setIsAiGenerating(false);
    }
  }, [canAiGenerate, title, tone, genre, subject, targetAudience, additionalNotes, apiKey, characterPromptTemplate, addCharacter]);

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
            Scene 02 · Cast
          </p>
          <h3 className="text-display text-xl font-semibold text-[var(--text-primary)]">
            등장인물
          </h3>
          <p className="text-body mt-1 text-xs italic leading-relaxed text-[var(--text-tertiary)]">
            이 작품의 세계에 서는 얼굴들을 섭외합니다.
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

      {/* AI casting success flash — auto-clears after 5s */}
      {lastAiAdded > 0 && !aiError && (
        <p
          role="status"
          aria-live="polite"
          className="text-body mb-4 flex items-baseline gap-2 text-xs italic text-[var(--color-brand-on-subtle)]"
        >
          <span aria-hidden="true" className="not-italic">✦</span>
          <span>
            <span className="font-semibold not-italic">{lastAiAdded}명 섭외 완료</span>
            <span className="ml-1.5 text-[var(--text-tertiary)]">
              · 이 얼굴들을 무대 위로 올렸습니다.
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
      {!canAiGenerate && !isAiGenerating && characters.length === 0 && (
        <p className="mb-3 text-xs text-[var(--text-tertiary)]">
          AI로 등장인물을 섭외하려면 제목과 장르가 먼저 필요해요.
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
              <CharacterDialog onSave={handleSaveNew} onCancel={handleCancel} />
            </div>
          )}
        </div>
      </div>

      {/* Character list */}
      {characters.length === 0 && dialogState !== 'new' ? (
        <p className="rounded-xl border border-dashed border-[var(--border-default)]
                      px-6 py-8 text-center text-sm text-[var(--text-tertiary)]">
          아직 등장인물이 없습니다. AI로 생성하거나 직접 추가해보세요.
        </p>
      ) : (
        <div className="space-y-3">
          {characters.map((char) => {
            const isEditing = dialogState === char.id;
            const isStreaming = streamingIds.has(char.id);
            return (
              <div key={char.id} className={isStreaming ? 'scene-in' : undefined}>
                <div
                  className="grid transition-all duration-[var(--duration-slow)] ease-out-quart"
                  style={{ gridTemplateRows: isEditing ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    {isEditing && (
                      <div className="pb-3">
                        <CharacterDialog character={char} onSave={handleSaveEdit} onCancel={handleCancel} />
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
                      <CharacterCard character={char} onEdit={() => handleEdit(char.id)} onRemove={() => handleRemove(char.id)} />
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
