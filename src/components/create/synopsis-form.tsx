'use client';

import BasicInfoSection from './basic-info-section';
import CharacterSection from './character-section';
import EventSection from './event-section';
import GenerationPanel from './generation-panel';
import ProductionRail from './production-rail';
import SceneDivider from './scene-divider';

/**
 * /create page orchestrator — director's workroom, 3-column workspace.
 *
 *  [ Rail · progress ]   [ Main canvas · sections ]   [ Sticky generation panel ]
 *         240px                flex (1fr)                      360–400px
 *
 * Sections on the main canvas are punctuated by SceneDividers — film-strip
 * transition markers — so the page reads like sequential reels rather than
 * a vertical form stack.
 *
 * On below-lg viewports the columns collapse to a single vertical stack in
 * reading order: rail summary → sections → generation CTA.
 */
export default function SynopsisForm() {
  return (
    <div
      className="grid gap-y-10
                 lg:grid-cols-[220px_minmax(0,1fr)_340px] lg:gap-x-10
                 xl:grid-cols-[240px_minmax(0,1fr)_380px] xl:gap-x-12"
    >
      {/* Left rail — progress summary & jump nav */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <ProductionRail />
      </aside>

      {/* Main canvas — sections separated by film-strip scene dividers */}
      <div className="min-w-0">
        <div id="section-basics" className="scroll-mt-24">
          <BasicInfoSection />
        </div>

        <div className="my-10 sm:my-12">
          <SceneDivider
            scene="02"
            label="Cast"
            caption="— cut to —"
          />
        </div>

        <div id="section-characters" className="scroll-mt-24">
          <CharacterSection />
        </div>

        <div className="my-10 sm:my-12">
          <SceneDivider
            scene="03"
            label="Beats"
            caption="— cut to —"
          />
        </div>

        <div id="section-events" className="scroll-mt-24">
          <EventSection />
        </div>
      </div>

      {/* Right rail — sticky generation panel */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <GenerationPanel />
      </aside>
    </div>
  );
}
