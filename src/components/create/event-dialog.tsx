'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { EventType, KeyEvent } from '@/types';
import { EVENT_TYPES } from '@/lib/constants';

interface EventDialogProps {
  event?: KeyEvent;
  nextSequence: number;
  onSave: (event: KeyEvent) => void;
  onCancel: () => void;
}

export default function EventDialog({ event, nextSequence, onSave, onCancel }: EventDialogProps) {
  const [title, setTitle] = useState(event?.title ?? '');
  const [type, setType] = useState<EventType>(event?.type ?? '전개');
  const [description, setDescription] = useState(event?.description ?? '');

  const isEdit = !!event;
  const canSave = title.trim().length > 0;

  function handleSave() {
    if (!canSave) return;
    onSave({
      id: event?.id ?? uuidv4(),
      title: title.trim(),
      type,
      description: description.trim(),
      sequence: event?.sequence ?? nextSequence,
    });
  }

  return (
    <div
      className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-raised)]
                 p-5 shadow-sm"
    >
      <h4 className="text-display mb-4 text-sm font-semibold text-[var(--text-primary)]">
        {isEdit ? '사건 수정' : '새 사건'}
      </h4>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="evt-title" className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
            사건 제목
          </label>
          <input
            id="evt-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="어떤 일이 벌어지나요?"
            className="w-full rounded-lg border border-[var(--border-default)]
                       bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)]
                       placeholder:text-[var(--text-tertiary)]
                       transition-colors duration-[var(--duration-normal)]
                       focus:border-[var(--color-brand)] focus:outline-none"
            autoFocus
          />
        </div>

        {/* Type — chip selector */}
        <div>
          <span className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">구분</span>
          <div className="flex flex-wrap gap-1.5">
            {EVENT_TYPES.map((t) => {
              const selected = type === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  aria-pressed={selected}
                  className={`rounded-full px-3 py-1 text-xs transition-all
                             duration-[var(--duration-normal)] ease-out-quart
                             ${
                               selected
                                 ? 'bg-[var(--color-brand)] text-white font-medium'
                                 : 'bg-[var(--bg-sunken)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                             }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="evt-desc" className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
            상세 설명
          </label>
          <textarea
            id="evt-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="이 사건의 구체적인 내용을 적어주세요"
            rows={3}
            className="w-full resize-none rounded-lg border border-[var(--border-default)]
                       bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)]
                       placeholder:text-[var(--text-tertiary)]
                       transition-colors duration-[var(--duration-normal)]
                       focus:border-[var(--color-brand)] focus:outline-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm text-[var(--text-secondary)]
                     transition-colors duration-[var(--duration-normal)]
                     hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium
                     text-white transition-colors duration-[var(--duration-normal)]
                     hover:bg-[var(--color-brand-hover)]
                     disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isEdit ? '수정 완료' : '추가'}
        </button>
      </div>
    </div>
  );
}
