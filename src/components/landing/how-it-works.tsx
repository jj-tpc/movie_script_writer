/**
 * How-it-works — 3-step flow with large display numbers and a connecting line.
 * Horizontal on desktop, vertical on mobile.
 */

const STEPS = [
  {
    number: "01",
    title: "설계",
    description: "장르, 톤, 캐릭터, 사건을 입력합니다.",
  },
  {
    number: "02",
    title: "생성",
    description: "AI가 입력한 요소를 엮어 시놉시스를 작성합니다.",
  },
  {
    number: "03",
    title: "완성",
    description: "편집하고 보관함에 저장합니다.",
  },
] as const;

export default function HowItWorks() {
  return (
    <section className="px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-5xl">
        {/* Section label */}
        <p className="text-display mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
          작업 흐름
        </p>
        <h2 className="text-display mb-16 max-w-sm text-2xl font-bold tracking-tight text-[var(--text-primary)] md:text-3xl">
          세 단계로 완성하는 시놉시스
        </h2>

        {/* Steps */}
        <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
          {/* Connecting line — horizontal on md+, vertical on mobile */}
          <div
            aria-hidden="true"
            className="absolute top-0 left-5 h-full w-px bg-[var(--border-subtle)]
                       md:top-[2.1rem] md:left-0 md:h-px md:w-full"
          />

          {STEPS.map((step, i) => (
            <div key={step.number} className="relative pl-14 md:pl-0">
              {/* Number circle */}
              <div
                className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center
                           rounded-full border border-[var(--border-default)]
                           bg-[var(--bg-base)]
                           md:relative md:mb-5"
              >
                <span className="text-display text-sm font-bold text-[var(--text-primary)]">
                  {step.number}
                </span>
              </div>

              <h3 className="text-display mb-2 text-lg font-bold tracking-tight text-[var(--text-primary)]">
                {step.title}
              </h3>
              <p className="text-body max-w-xs text-sm leading-relaxed text-[var(--text-secondary)]">
                {step.description}
              </p>

              {/* Arrow connector between steps on md+ */}
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute right-0 top-[2.1rem] hidden -translate-y-1/2 translate-x-1/2
                             text-[var(--text-tertiary)] md:block"
                >
                  &rarr;
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
