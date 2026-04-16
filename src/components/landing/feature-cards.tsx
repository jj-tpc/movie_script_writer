/**
 * Feature cards — editorial magazine layout with varied sizes.
 * One feature is emphasized larger; the other two are stacked beside it.
 */
export default function FeatureCards() {
  return (
    <section className="px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-5xl">
        {/* Section label */}
        <p className="text-display mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
          주요 기능
        </p>
        <h2 className="text-display mb-14 max-w-md text-2xl font-bold tracking-tight text-[var(--text-primary)] md:text-3xl">
          시놉시스 완성까지, 세 가지 핵심 도구
        </h2>

        {/* Editorial grid: 1 large + 2 stacked */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[1.3fr_1fr] md:gap-6">
          {/* ---- Feature 1: Large / emphasized ---- */}
          <div
            className="row-span-1 flex flex-col justify-end rounded-lg
                        border border-[var(--border-default)]
                        bg-[var(--bg-raised)] p-8 md:row-span-2 md:p-10"
          >
            <p className="text-display mb-2 text-sm font-semibold text-[var(--color-brand)]">
              01
            </p>
            <h3 className="text-display mb-4 text-xl font-bold tracking-tight text-[var(--text-primary)] md:text-2xl">
              캐릭터 설계
            </h3>
            <p className="text-body max-w-sm text-base leading-relaxed text-[var(--text-secondary)]">
              등장인물의 역할, 동기, 성격을 체계적으로 설계합니다. 주인공부터
              조연, 악역까지 &mdash; 살아 움직이는 인물을 만들어 보세요. 캐릭터
              간의 관계와 갈등 구조가 시놉시스의 골격이 됩니다.
            </p>
          </div>

          {/* ---- Feature 2: Top-right ---- */}
          <div
            className="rounded-lg border border-[var(--border-subtle)]
                        bg-[var(--bg-sunken)] p-7"
          >
            <p className="text-display mb-2 text-sm font-semibold text-[var(--text-tertiary)]">
              02
            </p>
            <h3 className="text-display mb-3 text-lg font-bold tracking-tight text-[var(--text-primary)]">
              사건 구조화
            </h3>
            <p className="text-body text-sm leading-relaxed text-[var(--text-secondary)]">
              발단부터 결말까지, 핵심 사건을 타임라인으로 배치합니다. 이야기의
              리듬과 긴장감을 시각적으로 확인하며 구조를 잡아보세요.
            </p>
          </div>

          {/* ---- Feature 3: Bottom-right ---- */}
          <div
            className="rounded-lg border border-[var(--border-default)]
                        bg-[var(--bg-overlay)] p-7"
          >
            <p className="text-display mb-2 text-sm font-semibold text-[var(--text-tertiary)]">
              03
            </p>
            <h3 className="text-display mb-3 text-lg font-bold tracking-tight text-[var(--text-primary)]">
              AI 시놉시스 생성
            </h3>
            <p className="text-body text-sm leading-relaxed text-[var(--text-secondary)]">
              입력한 요소를 바탕으로 완성도 높은 시놉시스를 AI가 생성합니다.
              로그라인부터 3막 구조까지, 전문 작가 수준의 초고를 받아보세요.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
