import { HelpSection } from "@/features/home/components/HelpSection";
import { HomeHero } from "@/features/home/components/HomeHero";
import { ShopByIndustry } from "@/features/home/components/ShopByIndustry";

export default function Home() {
  return (
    <>
      <HomeHero />
      {/* Featured Products section intentionally deferred — needs SAP Commerce.
          White spacer keeps a breathing band between the two gray sections. */}
      <div className="bg-white py-16" aria-hidden="true" />
      <HelpSection />
      <ShopByIndustry />
    </>

  );
}
