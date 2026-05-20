import type { ComponentType } from "react";
import type { HomePageSection } from "@/contracts/homePage";
import { Footer } from "@/features/footer/components/Footer";
import { FooterFallback } from "@/features/footer/components/FooterFallback";
import { Header } from "@/features/header/components/Header";
import { HeaderFallback } from "@/features/header/components/HeaderFallback";
import { FeaturedProducts } from "@/features/home/components/FeaturedProducts";
import { HelpSection } from "@/features/home/components/HelpSection";
import { HomeHero } from "@/features/home/components/HomeHero";
import { type BodySectionType, sectionMap } from "@/features/home/sectionMap";
import { getHomePage } from "@/server/domains/homePage/homePage.service";
import { logger } from "@/server/observability/logger";

export default async function Home() {
  const homePage = await getHomePage().catch((err: unknown) => {
    logger.error({ err }, "homePage.fetch-failed");
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
