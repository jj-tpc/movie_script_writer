import HeroSection from "@/components/landing/hero-section";
import FeatureCards from "@/components/landing/feature-cards";
import HowItWorks from "@/components/landing/how-it-works";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-[var(--bg-base)]">
      <HeroSection />

      <div className="h-px w-full bg-[var(--border-subtle)]" />

      <FeatureCards />

      <HowItWorks />
    </div>
  );
}
