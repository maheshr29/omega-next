import type { Entry, EntrySkeletonType } from "contentful";
import type { FeaturedProductsSection } from "@Types/featuredProductsSection";

/**
 * Contentful content model (id: "featuredProductsSection")
 *
 *   sectionTitle   Symbol/Text    headline above the carousel
 *   ctaText        Symbol         label for the "Browse all Products" button
 */

type AnyEntry = Entry<EntrySkeletonType, "WITHOUT_UNRESOLVABLE_LINKS">;

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" && v.length > 0 ? v : fallback;
}

export function toFeaturedProductsSection(
  entry: AnyEntry,
): FeaturedProductsSection {
  const fields = entry.fields as Record<string, unknown>;
  return {
    title: str(fields.sectionTitle).trim(),
    ctaText: str(fields.ctaText).trim() || undefined,
  };
}
