import SynopsisGallery from '@/components/synopses/synopsis-gallery';

export default function SynopsesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      {/* Archive header — filmography eyebrow + title */}
      <header className="mb-10 flex flex-col gap-3 border-b border-[var(--border-subtle)] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-display mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-tertiary)]">
            Filmography · 상영 목록
          </p>
          <h1 className="text-display text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            보관함
          </h1>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-[var(--text-secondary)] sm:text-right">
          완성된 시놉시스들이 포스터처럼 걸려 있습니다.
        </p>
      </header>

      <SynopsisGallery />
    </div>
  );
}
