import Link from "next/link";

/**
 * Hero section — evokes a filmmaker's workspace.
 * Left-aligned, asymmetric layout with a decorative screenplay fragment.
 */
export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pt-10 pb-20 sm:px-6 sm:pt-20 sm:pb-28 md:pt-32 md:pb-36 lg:pt-40 lg:pb-44">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 sm:gap-16 lg:grid-cols-[1fr_340px] lg:gap-12">
        {/* ---- Left: Copy + CTA ---- */}
        <div className="flex flex-col items-start gap-6 sm:gap-8">
          {/* Mobile/tablet-only condensed screenplay fragment — keeps the atmosphere
              above the fold without pushing the CTA down */}
          <div
            aria-hidden="true"
            className="relative w-full select-none rounded-md border
                       border-[var(--border-subtle)] bg-[var(--bg-raised)]
                       px-4 py-3 shadow-[0_2px_12px_var(--shadow-color)]
                       lg:hidden"
          >
            <p className="text-display text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
              #24. 도서관 &mdash; 밤
            </p>
            <p className="text-body mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
              &ldquo;이건&hellip; 처음부터 전부 거짓말이었어.&rdquo;
            </p>
            {/* Film-strip perforation dots */}
            <div className="absolute top-1/2 -left-1.5 flex -translate-y-1/2 flex-col gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <span
                  key={i}
                  className="block h-1.5 w-1.5 rounded-full bg-[var(--border-subtle)]"
                />
              ))}
            </div>
          </div>

          <h1
            className="text-display max-w-[18ch] font-bold leading-[1.08] tracking-tight text-[var(--text-primary)]"
            style={{
              fontSize: "clamp(2.4rem, 5vw + 0.5rem, 4rem)",
            }}
          >
            첫 장면은,
            <br />
            당신의 손에서.
          </h1>

          <p className="text-body max-w-md text-lg leading-relaxed text-[var(--text-secondary)]">
            톤과 장르를 정하고, 인물을 섭외하고, 사건의 순서를 세우세요.
            AI가 남은 공백을 이어, 한 편의 시놉시스로 엮어냅니다.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/create"
              className="text-display inline-flex items-center rounded-lg bg-[var(--color-brand)]
                         px-6 py-3 text-sm font-semibold tracking-tight
                         text-white transition-colors
                         duration-[var(--duration-normal)] ease-out-quart
                         hover:bg-[var(--color-brand-hover)]
                         focus-visible:outline-2 focus-visible:outline-offset-2
                         focus-visible:outline-[var(--color-brand)]"
            >
              작업실 들어가기
            </Link>

            <Link
              href="/synopses"
              className="text-body inline-flex items-center rounded-lg px-4 py-3
                         text-sm text-[var(--text-secondary)]
                         transition-colors duration-[var(--duration-normal)]
                         hover:text-[var(--text-primary)]
                         hover:bg-[var(--surface-hover)]"
            >
              지난 작품 펼쳐보기
              <span aria-hidden="true" className="ml-1.5">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* ---- Right: Decorative screenplay fragment ---- */}
        <aside
          aria-hidden="true"
          className="hidden select-none lg:block lg:pt-6"
        >
          <div
            className="relative rounded-lg border border-[var(--border-subtle)]
                        bg-[var(--bg-raised)] px-7 py-8 shadow-[0_2px_24px_var(--shadow-color)]"
          >
            {/* Page number */}
            <span className="text-display absolute top-3 right-4 text-xs tracking-widest text-[var(--text-tertiary)]">
              12
            </span>

            {/* Scene heading */}
            <p className="text-display mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
              #24. 도서관 &mdash; 밤
            </p>

            {/* Action line */}
            <p className="text-body mb-5 text-sm leading-relaxed text-[var(--text-secondary)]">
              오래된 책장 사이로 희미한 불빛이 새어 나온다.
              유진은 떨리는 손으로 봉투를 연다.
            </p>

            {/* Character name */}
            <p className="text-display mb-1 text-center text-xs font-semibold tracking-[0.2em] text-[var(--text-primary)]">
              유진
            </p>

            {/* Dialogue */}
            <p className="text-body mx-auto max-w-[22ch] text-center text-sm leading-relaxed text-[var(--text-primary)]">
              이건... 처음부터 전부 거짓말이었어.
            </p>

            {/* Film-strip perforation dots */}
            <div className="absolute top-0 -left-3 flex h-full flex-col justify-between py-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  className="block h-2 w-2 rounded-full bg-[var(--border-subtle)]"
                />
              ))}
            </div>
          </div>

          {/* Second fragment — smaller, offset */}
          <div
            className="mt-3 ml-10 rounded-md border border-[var(--border-subtle)]
                        bg-[var(--bg-overlay)] px-5 py-4"
          >
            <p className="text-display mb-1 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
              #25. 옥상 &mdash; 새벽
            </p>
            <p className="text-body text-sm leading-relaxed text-[var(--text-tertiary)]">
              바람이 유진의 머리카락을 흩뜨린다.
              멀리 도시의 불빛이 하나둘 꺼진다.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
