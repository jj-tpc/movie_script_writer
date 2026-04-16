import SynopsisForm from '@/components/create/synopsis-form';

export const metadata = {
  title: '새 시놉시스 — 시놉시스 공방',
  description: '새로운 영화 시놉시스를 작성합니다.',
};

export default function CreatePage() {
  /**
   * Production date stamp — server-rendered per request.
   * Formatted as YYYY.MM.DD to feel like a physical production mark,
   * not an ISO timestamp or a localized date-picker string.
   */
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const dateStamp = `${y}.${m}.${d}`;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      {/* Production header — dramatic title card, asymmetric stamp on the right */}
      <header className="mb-12 border-b border-[var(--border-subtle)] pb-10 sm:mb-16">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-display mb-4 text-[11px] font-bold uppercase tracking-[0.32em] text-[var(--text-tertiary)]">
              Production · New Scene
            </p>
            <h1 className="text-display text-4xl font-black leading-[0.95] tracking-tight text-[var(--text-primary)] sm:text-5xl">
              새 시놉시스
            </h1>
          </div>

          {/* Production stamp — feels like an ink rubber-stamp on the header */}
          <div className="flex shrink-0 items-center gap-4 self-start sm:self-end">
            <span
              aria-hidden="true"
              className="hidden h-10 w-px bg-[var(--border-default)] sm:block"
            />
            <div className="flex flex-col items-start sm:items-end">
              <span className="text-display text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-tertiary)]">
                Roll · Date
              </span>
              <span className="text-display mt-1 text-lg font-bold tabular-nums text-[var(--text-secondary)]">
                {dateStamp}
              </span>
            </div>
          </div>
        </div>

        <p className="text-body mt-6 max-w-xl text-sm italic leading-relaxed text-[var(--text-secondary)]">
          작품의 기본 정보, 등장인물, 주요 사건을 입력하면 AI가 시놉시스를 생성합니다.
        </p>
      </header>

      <SynopsisForm />
    </div>
  );
}
