import type { ComponentType } from "react";
import type { HomePageSection } from "@shared/types/homePage";
import { Footer } from "@/components/organisms/Footer/Footer";
import { FooterFallback } from "@/components/organisms/Footer/FooterFallback";
import { Header } from "@/components/organisms/Header/Header";
import { HeaderFallback } from "@/components/organisms/Header/HeaderFallback";
import { FeaturedProducts } from "@/components/organisms/FeaturedProducts/FeaturedProducts";
import { HelpSection } from "@/components/organisms/HelpSection";
import { HomeHero } from "@/components/organisms/HomeHero";
import { type BodySectionType, sectionMap } from "@/components/pages/Home/sectionMap";
import { bff } from "@/lib/api/bff";

export default async function Home() {
  const homePage = await bff.homepage.get().catch((err: unknown) => {
    console.error("homePage.fetch-failed", err);
    return null;
  });

  const sections = homePage?.sections ?? [];
  const header = sections.find(
    (s): s is Extract<HomePageSection, { type: "header" }> =>
      s.type === "header",
  );
  const footer = sections.find(
    (s): s is Extract<HomePageSection, { type: "footer" }> =>
      s.type === "footer",
  );
  const bodySections = sections.filter(
    (s): s is Extract<HomePageSection, { type: BodySectionType }> =>
      s.type !== "header" && s.type !== "footer",
  );

  const useStaticFallback = sections.length === 0;

  return (
    <>
      {header ? <Header data={header.data} /> : <HeaderFallback />}
      <main className="flex-1">
        {useStaticFallback ? (
          <>
            <HomeHero />
            <FeaturedProducts />
            <HelpSection />
          </>
        ) : (
          bodySections.map((section, i) => {
            const Component = sectionMap[section.type] as
              | ComponentType<{ data: typeof section.data }>
              | undefined;
            if (!Component) return null;
            return (
              <Component
                key={`${section.type}-${i}`}
                data={section.data}
              />
            );
          })
        )}
      </main>
      {footer ? <Footer data={footer.data} /> : <FooterFallback />}
    </>
  );
}
