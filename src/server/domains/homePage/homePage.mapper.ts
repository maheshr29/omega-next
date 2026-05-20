import type { Entry, EntrySkeletonType } from "contentful";
import type { HomePage, HomePageSection } from "@/contracts/homePage";
import { toFeaturedProductsSection } from "@/server/domains/featuredProductsSection/featuredProductsSection.mapper";
import { toFooter } from "@/server/domains/footer/footer.mapper";
import { toHeader } from "@/server/domains/header/header.mapper";
import { toHelpSection } from "@/server/domains/helpSection/helpSection.mapper";
import { toHeroBanner } from "@/server/domains/heroBanner/heroBanner.mapper";
import { toIndustrySection } from "@/server/domains/industrySection/industrySection.mapper";

/**
 * Contentful content model (id: "homePage")
 *
 *   internalName   Symbol               editor label
 *   components     Reference[] → Entry  ordered list of section entries to render
 *
 * Each linked entry's contentType.sys.id determines how it maps onto the
 * `HomePageSection` discriminated union below.
 */

type AnyEntry = Entry<EntrySkeletonType, "WITHOUT_UNRESOLVABLE_LINKS">;

function toSection(entry: AnyEntry | undefined): HomePageSection | null {
  if (!entry) return null;
  const typeId = entry.sys.contentType.sys.id;
  switch (typeId) {
    case "header":
      return { type: "header", data: toHeader(entry) };
    case "heroBanner":
      return { type: "heroBanner", data: toHeroBanner(entry) };
    case "featuredProductsSection":
      return {
        type: "featuredProductsSection",
        data: toFeaturedProductsSection(entry),
      };
    case "helpSection":
      return { type: "helpSection", data: toHelpSection(entry) };
    case "industrySection":
      return { type: "industrySection", data: toIndustrySection(entry) };
    case "footer":
      return { type: "footer", data: toFooter(entry) };
    default:
      return null;
  }
}

export function toHomePage(entry: AnyEntry): HomePage {
  const fields = entry.fields as Record<string, unknown>;
  const components = Array.isArray(fields.components)
    ? (fields.components as AnyEntry[])
    : [];
  const sections = components
    .map(toSection)
    .filter((s): s is HomePageSection => s !== null);
  return { sections };
}
