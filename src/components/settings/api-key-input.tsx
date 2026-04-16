'use client';

import { useState } from 'react';
import { useSettingsStore } from '@/stores/settings-store';

function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function ApiKeyInput() {
  const [visible, setVisible] = useState(false);
  const apiKey = useSettingsStore((s) => s.settings.apiKey);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  return (
    <div>
      <label
        htmlFor="api-key"
        className="text-display mb-1.5 block text-sm font-medium text-[var(--text-primary)]"
      >
        Anthropic API 키
      </label>
      <p className="mb-3 text-xs text-[var(--text-tertiary)]">
        시놉시스 생성에 사용할 API 키를 입력하세요
      </p>
      <div className="relative">
        <input
          id="api-key"
          type={visible ? 'text' : 'password'}
          value={apiKey}
          onChange={(e) => updateSettings({ apiKey: e.target.value })}
          placeholder="sk-ant-..."
          className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-base)]
                     px-3 py-2.5 pr-12 text-sm text-[var(--text-primary)]
                     placeholder:text-[var(--text-tertiary)]
                     transition-colors duration-[var(--duration-fast)]
                     focus:border-[var(--color-brand)] focus:outline-none focus:ring-1
                     focus:ring-[var(--color-brand)]"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          onClick={() => setVisible((v) => !v)}
          className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center
                     justify-center rounded-md text-[var(--text-tertiary)]
                     transition-colors duration-[var(--duration-fast)]
                     hover:text-[var(--text-secondary)]"
          aria-label={visible ? 'API 키 숨기기' : 'API 키 보기'}
          aria-pressed={visible}
          type="button"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}
