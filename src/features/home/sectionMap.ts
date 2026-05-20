import type { ComponentType } from "react";
import type { HomePageSection } from "@/contracts/homePage";
import { FeaturedProducts } from "@/features/home/components/FeaturedProducts";
import { HelpSection } from "@/features/home/components/HelpSection";
import { HomeHero } from "@/features/home/components/HomeHero";
import { ShopByIndustry } from "@/features/home/components/ShopByIndustry";

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
