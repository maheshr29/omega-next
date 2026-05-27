import type { ComponentType } from "react";
import type { HomePageSection } from "@shared/types/homePage";
import { FeaturedProducts } from "@/components/organisms/FeaturedProducts/FeaturedProducts";
import { HelpSection } from "@/components/organisms/HelpSection";
import { HomeHero } from "@/components/organisms/HomeHero";
import { ShopByIndustry } from "@/components/organisms/ShopByIndustry";

export type BodySectionType = Exclude<
  HomePageSection["type"],
  "header" | "footer"
>;

type SectionMap = {
  [K in BodySectionType]: ComponentType<{
    data: Extract<HomePageSection, { type: K }>["data"];
  }>;
};

export const sectionMap: SectionMap = {
  heroBanner: HomeHero,
  featuredProductsSection: FeaturedProducts,
  helpSection: HelpSection,
  industrySection: ShopByIndustry,
};
