/**
 * Public BFF contract for the composed home page.
 *
 * A `HomePage` is the ordered list of sections that come back from the single
 * `homePage` Contentful entry. Each section is a discriminated union member,
 * so renderers can `switch (section.type)` and stay exhaustive.
 *
 * Frontend renderers import from here only.
 */

import type { FeaturedProductsSection } from "../featuredProductsSection";
import type { Footer } from "../footer";
import type { Header } from "../header";
import type { HelpSection } from "../helpSection";
import type { HeroBanner } from "../heroBanner";
import type { IndustrySection } from "../industrySection";

export type HomePageSection =
  | { type: "header"; data: Header }
  | { type: "heroBanner"; data: HeroBanner }
  | { type: "featuredProductsSection"; data: FeaturedProductsSection }
  | { type: "helpSection"; data: HelpSection }
  | { type: "industrySection"; data: IndustrySection }
  | { type: "footer"; data: Footer };

export type HomePageSectionType = HomePageSection["type"];

export type HomePage = {
  sections: HomePageSection[];
};
