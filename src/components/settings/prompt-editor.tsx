'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSettingsStore } from '@/stores/settings-store';

type PromptTab = 'synopsis' | 'character' | 'event';

const TABS: { key: PromptTab; label: string; description: string }[] = [
  { key: 'synopsis', label: '시놉시스 생성', description: '전체 시놉시스를 생성할 때 사용하는 프롬프트' },
  { key: 'character', label: '등장인물 생성', description: '등장인물을 AI로 생성할 때 사용하는 프롬프트' },
  { key: 'event', label: '핵심사건 생성', description: '핵심 사건을 AI로 생성할 때 사용하는 프롬프트' },
];

const TEMPLATE_VARIABLES: Record<PromptTab, string[]> = {
  synopsis: [
    '{{title}}', '{{genre}}', '{{tone}}', '{{subject}}',
    '{{targetAudience}}', '{{characters}}', '{{keyEvents}}', '{{additionalNotes}}',
  ],
  character: [
    '{{title}}', '{{genre}}', '{{tone}}', '{{subject}}',
    '{{targetAudience}}', '{{additionalNotes}}',
  ],
  event: [
    '{{title}}', '{{genre}}', '{{tone}}', '{{subject}}',
    '{{targetAudience}}', '{{characters}}', '{{additionalNotes}}',
  ],
};

const SETTINGS_KEYS: Record<PromptTab, 'promptTemplate' | 'characterPromptTemplate' | 'eventPromptTemplate'> = {
  synopsis: 'promptTemplate',
  character: 'characterPromptTemplate',
  event: 'eventPromptTemplate',
};

export default function PromptEditor() {
  const [activeTab, setActiveTab] = useState<PromptTab>('synopsis');

  const promptTemplate = useSettingsStore((s) => s.settings.promptTemplate);
  const characterPromptTemplate = useSettingsStore((s) => s.settings.characterPromptTemplate);
  const eventPromptTemplate = useSettingsStore((s) => s.settings.eventPromptTemplate);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const resetPromptTemplate = useSettingsStore((s) => s.resetPromptTemplate);
  const resetCharacterPromptTemplate = useSettingsStore((s) => s.resetCharacterPromptTemplate);
  const resetEventPromptTemplate = useSettingsStore((s) => s.resetEventPromptTemplate);

  const templates: Record<PromptTab, string> = {
    synopsis: promptTemplate,
    character: characterPromptTemplate,
    event: eventPromptTemplate,
  };

  const resetFunctions: Record<PromptTab, () => void> = {
    synopsis: resetPromptTemplate,
    character: resetCharacterPromptTemplate,
    event: resetEventPromptTemplate,
  };

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const handleChange = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      const settingsKey = SETTINGS_KEYS[activeTab];
      debounceRef.current = setTimeout(() => {
        updateSettings({ [settingsKey]: value });
      }, 500);
    },
    [updateSettings, activeTab],
  );

  const currentTab = TABS.find((t) => t.key === activeTab)!;
  const currentVariables = TEMPLATE_VARIABLES[activeTab];
  const currentTemplate = templates[activeTab];
  const currentReset = resetFunctions[activeTab];

  return (
    <div>
      {/* Prompt sub-tabs */}
      <div
        role="tablist"
        aria-label="프롬프트 선택"
        className="mb-5 flex gap-1 rounded-lg bg-[var(--bg-sunken)] p-1"
      >
        {TABS.map((tab) => {
          const selected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              id={`prompt-tab-${tab.key}`}
              role="tab"
              aria-selected={selected}
              aria-controls={`prompt-panel-${tab.key}`}
              tabIndex={selected ? 0 : -1}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all
                         duration-[var(--duration-normal)]
                         ${selected
                           ? 'bg-[var(--bg-raised)] text-[var(--text-primary)] shadow-sm'
                           : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                         }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        id={`prompt-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`prompt-tab-${activeTab}`}
      >
        <p className="mb-3 text-xs text-[var(--text-tertiary)]">
          {currentTab.description}
        </p>

        {/* Template variable chips */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {currentVariables.map((v) => (
            <span
              key={v}
              className="rounded-md bg-[var(--bg-sunken)] px-2 py-0.5 font-mono text-xs
                         text-[var(--text-secondary)]"
            >
              {v}
            </span>
          ))}
        </div>

        {/* Textarea — key forces re-mount on tab switch so defaultValue refreshes */}
        <textarea
          key={activeTab}
          id={`prompt-template-${activeTab}`}
          defaultValue={currentTemplate}
          onChange={(e) => handleChange(e.target.value)}
          rows={16}
          className="w-full resize-y rounded-lg border border-[var(--border-default)]
                     bg-[var(--bg-base)] px-4 py-3 font-mono text-sm leading-relaxed
                     text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]
                     transition-colors duration-[var(--duration-fast)]
                     focus:border-[var(--color-brand)] focus:outline-none focus:ring-1
                     focus:ring-[var(--color-brand)]"
          spellCheck={false}
        />

        {/* Reset button */}
        <div className="mt-3">
          <button
            onClick={currentReset}
            className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-raised)]
                       px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors
                       duration-[var(--duration-fast)]
                       hover:border-[var(--border-default)] hover:text-[var(--text-primary)]"
            type="button"
          >
            기본값으로 복원
          </button>
        </div>
      </div>
    </div>
  );
}
