'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Character, CharacterRole } from '@/types';
import { CHARACTER_ROLES } from '@/lib/constants';

interface CharacterDialogProps {
  character?: Character;
  onSave: (character: Character) => void;
  onCancel: () => void;
}

export default function CharacterDialog({ character, onSave, onCancel }: CharacterDialogProps) {
  const [name, setName] = useState(character?.name ?? '');
  const [role, setRole] = useState<CharacterRole>(character?.role ?? '주인공');
  const [description, setDescription] = useState(character?.description ?? '');
  const [motivation, setMotivation] = useState(character?.motivation ?? '');

  const isEdit = !!character;
  const canSave = name.trim().length > 0;

  // Stable ids scoped to this instance — multiple dialogs can coexist
  const uid = useId();
  const titleId = `char-dialog-title-${uid}`;
  const nameId = `char-name-${uid}`;
  const descId = `char-desc-${uid}`;
  const motivId = `char-motiv-${uid}`;

  // Focus the first field on mount (replaces autoFocus so it works reliably
  // inside the parent's grid-rows expansion animation)
  const nameInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // Escape to cancel — scoped to the form so global shortcuts still work elsewhere
  function handleKeyDown(e: React.KeyboardEvent<HTMLFormElement>) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onCancel();
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSave) return;
    onSave({
      id: character?.id ?? uuidv4(),
      name: name.trim(),
      role,
      description: description.trim(),
      motivation: motivation.trim(),
    });
  }

  return (
    <form
      role="group"
      aria-labelledby={titleId}
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-raised)]
                 p-5 shadow-sm"
    >
      <h4
        id={titleId}
        className="text-display mb-4 text-sm font-semibold text-[var(--text-primary)]"
      >
        {isEdit ? '캐릭터 수정' : '새 캐릭터'}
      </h4>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label
            htmlFor={nameId}
            className="mb-1 block text-xs font-medium text-[var(--text-secondary)]"
          >
            이름
          </label>
          <input
            ref={nameInputRef}
            id={nameId}
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="캐릭터 이름"
            className="w-full rounded-lg border border-[var(--border-default)]
                       bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)]
                       placeholder:text-[var(--text-tertiary)]
                       transition-colors duration-[var(--duration-normal)]
                       focus:border-[var(--color-brand)] focus:outline-none"
          />
        </div>

        {/* Role — chip selector */}
        <fieldset>
          <legend className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">
            역할
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {CHARACTER_ROLES.map((r) => {
              const selected = role === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  aria-pressed={selected}
                  className={`rounded-full px-3 py-1 text-xs transition-all
                             duration-[var(--duration-normal)] ease-out-quart
                             ${
                               selected
                                 ? 'bg-[var(--color-brand)] text-white font-medium'
                                 : 'bg-[var(--bg-sunken)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                             }`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Description */}
        <div>
          <label
            htmlFor={descId}
            className="mb-1 block text-xs font-medium text-[var(--text-secondary)]"
          >
            설명
          </label>
          <textarea
            id={descId}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="캐릭터의 성격, 외모, 배경 등"
            rows={2}
            className="w-full resize-none rounded-lg border border-[var(--border-default)]
                       bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)]
                       placeholder:text-[var(--text-tertiary)]
                       transition-colors duration-[var(--duration-normal)]
                       focus:border-[var(--color-brand)] focus:outline-none"
          />
        </div>

        {/* Motivation */}
        <div>
          <label
            htmlFor={motivId}
            className="mb-1 block text-xs font-medium text-[var(--text-secondary)]"
          >
            동기
          </label>
          <textarea
            id={motivId}
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            placeholder="이 캐릭터가 원하는 것, 두려워하는 것"
            rows={2}
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
          취소 <span className="ml-1 text-[10px] text-[var(--text-tertiary)]">Esc</span>
        </button>
        <button
          type="submit"
          disabled={!canSave}
          className="rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium
                     text-white transition-colors duration-[var(--duration-normal)]
                     hover:bg-[var(--color-brand-hover)]
                     disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isEdit ? '수정 완료' : '추가'}
        </button>
      </div>
    </form>
  );
}
