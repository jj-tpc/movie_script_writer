/**
 * Scene transition divider — stands between /create sections.
 *
 * Reads as a fragment of 35mm film: a center scene marker flanked by
 * perforation holes. Uses extreme typographic contrast — a large scene
 * number paired with tiny overlines — to read immediately as cinema, not
 * as a generic divider.
 */
type SceneDividerProps = {
  scene: string; // e.g. "02"
  label: string; // English overline, e.g. "Cast"
  caption?: string; // Optional Korean subtitle
};

export default function SceneDivider({ scene, label, caption }: SceneDividerProps) {
  return (
    <div
      role="separator"
      aria-label={`Scene ${scene} · ${label}`}
      className="relative flex flex-col items-center gap-3 py-2"
    >
      {/* Film strip row */}
      <div className="flex w-full items-center gap-5">
        {/* Left perforations — filmstrip edge */}
        <div
          aria-hidden="true"
          className="flex flex-1 items-center justify-end gap-1.5 overflow-hidden"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="h-2.5 w-4 shrink-0 rounded-[2px] border border-[var(--border-default)]"
            />
          ))}
        </div>

        {/* Center — extreme contrast: tiny SCENE / big number / tiny LABEL */}
        <div className="flex shrink-0 items-center gap-3.5 whitespace-nowrap sm:gap-5">
          <span className="text-display text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--text-tertiary)]">
            Scene
          </span>
          <span className="text-display text-2xl font-black leading-none tabular-nums text-[var(--text-primary)] sm:text-3xl">
            {scene}
          </span>
          <span
            aria-hidden="true"
            className="h-4 w-px bg-[var(--border-default)]"
          />
          <span className="text-display text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--text-secondary)]">
            {label}
          </span>
        </div>

        {/* Right perforations */}
        <div
          aria-hidden="true"
          className="flex flex-1 items-center gap-1.5 overflow-hidden"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="h-2.5 w-4 shrink-0 rounded-[2px] border border-[var(--border-default)]"
            />
          ))}
        </div>
      </div>

      {/* Optional Korean caption under the strip */}
      {caption && (
        <p className="text-body text-xs italic text-[var(--text-tertiary)]">
          {caption}
        </p>
      )}
    </div>
  );
}
