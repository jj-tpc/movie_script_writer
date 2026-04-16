'use client';

import { useEffect, useRef, useState } from 'react';
import { useSettingsStore } from '@/stores/settings-store';
import { useSynopsesStore } from '@/stores/synopses-store';
import { GENRES, TONES } from '@/lib/constants';
import ApiKeyInput from './api-key-input';
import PromptEditor from './prompt-editor';

type TabKey = 'general' | 'prompt' | 'data';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'general', label: '일반' },
  { key: 'prompt', label: '프롬프트' },
  { key: 'data', label: '데이터' },
];

type Theme = 'light' | 'dark' | 'system';

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: 'light', label: '밝은 모드' },
  { value: 'dark', label: '어두운 모드' },
  { value: 'system', label: '시스템' },
];

function applyTheme(theme: Theme) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark);

  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem('theme', theme);
}

/* ------------------------------------------------------------------ */
/*  General Tab                                                        */
/* ------------------------------------------------------------------ */
function GeneralTab() {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const handleThemeChange = (theme: Theme) => {
    updateSettings({ theme });
    applyTheme(theme);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* API Key */}
      <ApiKeyInput />

      {/* Theme selector */}
      <div>
        <p className="text-display mb-3 text-sm font-medium text-[var(--text-primary)]">
          테마
        </p>
        <div role="radiogroup" aria-label="테마" className="flex gap-2">
          {THEME_OPTIONS.map((opt) => {
            const selected = settings.theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleThemeChange(opt.value)}
                role="radio"
                aria-checked={selected}
                className={`rounded-lg px-4 py-2 text-sm transition-colors
                           duration-[var(--duration-fast)]
                           ${
                             selected
                               ? 'bg-[var(--color-brand)] text-white font-medium'
                               : 'bg-[var(--bg-sunken)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                           }`}
                type="button"
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Default genre */}
      <div>
        <label
          htmlFor="default-genre"
          className="text-display mb-1.5 block text-sm font-medium text-[var(--text-primary)]"
        >
          기본 장르
        </label>
        <p className="mb-3 text-xs text-[var(--text-tertiary)]">
          새 시놉시스 작성 시 기본으로 선택될 장르
        </p>
        <select
          id="default-genre"
          value={settings.defaultGenre}
          onChange={(e) => updateSettings({ defaultGenre: e.target.value })}
          className="w-full max-w-xs rounded-lg border border-[var(--border-default)]
                     bg-[var(--bg-base)] px-3 py-2.5 text-sm text-[var(--text-primary)]
                     transition-colors duration-[var(--duration-fast)]
                     focus:border-[var(--color-brand)] focus:outline-none focus:ring-1
                     focus:ring-[var(--color-brand)]"
        >
          <option value="">선택 안 함</option>
          {GENRES.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </div>

      {/* Default tone */}
      <div>
        <label
          htmlFor="default-tone"
          className="text-display mb-1.5 block text-sm font-medium text-[var(--text-primary)]"
        >
          기본 톤
        </label>
        <p className="mb-3 text-xs text-[var(--text-tertiary)]">
          새 시놉시스 작성 시 기본으로 선택될 톤/분위기
        </p>
        <select
          id="default-tone"
          value={settings.defaultTone}
          onChange={(e) => updateSettings({ defaultTone: e.target.value })}
          className="w-full max-w-xs rounded-lg border border-[var(--border-default)]
                     bg-[var(--bg-base)] px-3 py-2.5 text-sm text-[var(--text-primary)]
                     transition-colors duration-[var(--duration-fast)]
                     focus:border-[var(--color-brand)] focus:outline-none focus:ring-1
                     focus:ring-[var(--color-brand)]"
        >
          <option value="">선택 안 함</option>
          {TONES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Data Tab                                                           */
/* ------------------------------------------------------------------ */
function DataTab() {
  const synopses = useSynopsesStore((s) => s.synopses);
  const removeSynopsis = useSynopsesStore((s) => s.removeSynopsis);
  const addSynopsis = useSynopsesStore((s) => s.addSynopsis);

  const [confirmClear, setConfirmClear] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = JSON.stringify(synopses, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `synopses-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!Array.isArray(parsed)) {
          setImportStatus('올바른 형식의 파일이 아닙니다');
          return;
        }

        let count = 0;
        const existingIds = new Set(synopses.map((s) => s.id));

        for (const item of parsed) {
          if (item.id && item.input && item.content && !existingIds.has(item.id)) {
            addSynopsis(item);
            count++;
          }
        }

        setImportStatus(
          count > 0
            ? `${count}개의 시놉시스를 가져왔습니다.`
            : '가져올 새 시놉시스가 없습니다.'
        );
      } catch {
        setImportStatus('파일을 읽는 중 오류가 발생했습니다.');
      }

      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    const ids = synopses.map((s) => s.id);
    ids.forEach((id) => removeSynopsis(id));
    setConfirmClear(false);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Export */}
      <div>
        <p className="text-display mb-1.5 text-sm font-medium text-[var(--text-primary)]">
          내보내기
        </p>
        <p className="mb-3 text-xs text-[var(--text-tertiary)]">
          저장된 모든 시놉시스를 JSON 파일로 다운로드합니다 (현재 {synopses.length}개)
        </p>
        <button
          onClick={handleExport}
          disabled={synopses.length === 0}
          className="rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium
                     text-white transition-colors duration-[var(--duration-fast)]
                     hover:bg-[var(--color-brand-hover)]
                     disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
        >
          JSON으로 내보내기
        </button>
      </div>

      {/* Import */}
      <div>
        <p className="text-display mb-1.5 text-sm font-medium text-[var(--text-primary)]">
          가져오기
        </p>
        <p className="mb-3 text-xs text-[var(--text-tertiary)]">
          이전에 내보낸 JSON 파일에서 시놉시스를 가져옵니다
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
        />
        <button
          onClick={handleImport}
          className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-raised)]
                     px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors
                     duration-[var(--duration-fast)]
                     hover:text-[var(--text-primary)]"
          type="button"
        >
          JSON에서 가져오기
        </button>
        {importStatus && (
          <p className="mt-2 text-xs text-[var(--text-secondary)]">
            {importStatus}
          </p>
        )}
      </div>

      {/* Clear all */}
      <div>
        <p className="text-display mb-1.5 text-sm font-medium text-[var(--text-primary)]">
          데이터 초기화
        </p>
        <p className="mb-3 text-xs text-[var(--text-tertiary)]">
          보관함의 모든 작품을 삭제합니다. 되돌릴 수 없습니다.
        </p>
        {confirmClear ? (
          <div className="flex items-center gap-3 rounded-lg border border-[var(--color-error)] bg-[var(--bg-raised)] px-4 py-3">
            <span className="text-sm text-[var(--color-error)]">
              보관함을 비울까요? 보관된 모든 작품이 삭제되며, 되돌릴 수 없습니다.
            </span>
            <button
              onClick={handleClearAll}
              className="shrink-0 rounded-lg bg-[var(--color-error)] px-3 py-1.5 text-xs
                         font-medium text-white transition-opacity hover:opacity-90"
              type="button"
            >
              확인
            </button>
            <button
              onClick={() => setConfirmClear(false)}
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs text-[var(--text-secondary)]
                         transition-colors hover:text-[var(--text-primary)]"
              type="button"
            >
              취소
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmClear(true)}
            disabled={synopses.length === 0}
            className="rounded-lg border border-[var(--color-error)] px-4 py-2 text-sm
                       text-[var(--color-error)] transition-colors
                       duration-[var(--duration-fast)]
                       hover:bg-[var(--color-error)] hover:text-white
                       disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
          >
            보관함 비우기
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Settings Form (with tabs)                                          */
/* ------------------------------------------------------------------ */
export default function SettingsForm() {
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('general');

  useEffect(() => {
    useSettingsStore.persist.rehydrate();
    useSynopsesStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-[var(--bg-sunken)]" />
        <div className="h-64 animate-pulse rounded-lg bg-[var(--bg-sunken)]" />
      </div>
    );
  }

  return (
    <div
      className="grid gap-y-6
                 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-x-12
                 xl:grid-cols-[220px_minmax(0,1fr)] xl:gap-x-16"
    >
      {/* Sidebar nav — vertical on desktop, horizontal scroller on mobile */}
      <nav
        role="tablist"
        aria-label="설정 섹션"
        aria-orientation="vertical"
        className="-mx-4 flex gap-1 overflow-x-auto border-b border-[var(--border-subtle)]
                   px-4 pb-2
                   lg:sticky lg:top-20 lg:mx-0 lg:flex-col lg:self-start lg:overflow-visible
                   lg:border-0 lg:p-0"
      >
        <p className="text-display hidden text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-tertiary)] lg:mb-3 lg:block">
          섹션
        </p>

        {TABS.map((tab) => {
          const selected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              id={`settings-tab-${tab.key}`}
              role="tab"
              aria-selected={selected}
              aria-controls={`settings-panel-${tab.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveTab(tab.key)}
              className={`relative shrink-0 rounded-md px-3 py-2 text-sm
                         transition-colors duration-[var(--duration-fast)]
                         lg:w-full lg:text-left
                         ${
                           selected
                             ? 'bg-[var(--surface-active)] font-medium text-[var(--color-brand)]'
                             : 'text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-secondary)]'
                         }`}
              type="button"
            >
              {/* Vertical brand bar on active (desktop) */}
              {selected && (
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 left-0 hidden h-5 w-0.5 -translate-y-1/2 rounded-full bg-[var(--color-brand)] lg:block"
                />
              )}
              <span className="lg:pl-3">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Tab content — main panel */}
      <div
        id={`settings-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`settings-tab-${activeTab}`}
        className="min-w-0"
      >
        {activeTab === 'general' && <GeneralTab />}
        {activeTab === 'prompt' && <PromptEditor />}
        {activeTab === 'data' && <DataTab />}
      </div>
    </div>
  );
}
