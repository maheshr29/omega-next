import { Suspense } from "react";
import { FeaturedProducts } from "@/features/home/components/FeaturedProducts";
import { FeaturedProductsFallback } from "@/features/home/components/FeaturedProductsFallback";
import { HelpSection } from "@/features/home/components/HelpSection";
import { HomeHero } from "@/features/home/components/HomeHero";
import { ShopByIndustry } from "@/features/home/components/ShopByIndustry";

export default function Home() {
  return (
    <>
      <HomeHero />
      <Suspense fallback={<FeaturedProductsFallback />}>
        <FeaturedProducts />
      </Suspense>
      <HelpSection />
      <ShopByIndustry />
    </>
  );
}
