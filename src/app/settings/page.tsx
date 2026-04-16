import SettingsForm from '@/components/settings/settings-form';

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      {/* Production header — Cutting Room eyebrow + title */}
      <header className="mb-10 border-b border-[var(--border-subtle)] pb-8">
        <p className="text-display mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-tertiary)]">
          Cutting Room · 편집실
        </p>
        <h1 className="text-display text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
          설정
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">
          API 키, 기본값, 프롬프트, 데이터 관리를 한곳에서.
        </p>
      </header>

      <SettingsForm />
    </div>
  );
}
