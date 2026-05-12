import type { Asset, Entry, EntrySkeletonType } from "contentful";
import type {
  IndustryCard,
  IndustryImage,
  IndustrySection,
} from "@/contracts/industrySection";

/**
 * Contentful content model (id: "industrySection")
 *
 *   sectionTitle   Symbol/Text          "Shop by Industry"
 *   cards          Reference[] → industryCard
 *
 * industryCard fields:
 *   title          Symbol               main label
 *   overlayText    Symbol (optional)    text rendered on the tile; defaults to title
 *   image          Asset                tile background image
 *   href / url     Symbol (optional)    link destination — if absent the component
 *                                       derives a route from the title.
 */

type AnyEntry = Entry<EntrySkeletonType, "WITHOUT_UNRESOLVABLE_LINKS">;

function assetToImage(asset: Asset | undefined): IndustryImage | undefined {
  if (!asset?.fields?.file) return undefined;
  const file = asset.fields.file;
  const rawUrl = typeof file.url === "string" ? file.url : "";
  if (!rawUrl) return undefined;
  const details =
    file.details && typeof file.details === "object"
      ? (file.details as { image?: { width?: number; height?: number } })
      : undefined;
  return {
    url: rawUrl.startsWith("//") ? `https:${rawUrl}` : rawUrl,
    alt:
      typeof asset.fields.title === "string" ? asset.fields.title : undefined,
    width: details?.image?.width,
    height: details?.image?.height,
  };
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" && v.length > 0 ? v : fallback;
}

function toIndustryCard(entry: AnyEntry | undefined): IndustryCard | null {
  if (!entry) return null;
  const fields = entry.fields as Record<string, unknown>;
  const label = (str(fields.overlayText) || str(fields.title)).trim();
  if (!label) return null;
  const image = assetToImage(fields.image as Asset | undefined);
  const href =
    str(fields.href).trim() ||
    str(fields.url).trim() ||
    str(fields.linkUrl).trim() ||
    undefined;
  return { label, href, image };
}

export function toIndustrySection(entry: AnyEntry): IndustrySection {
  const fields = entry.fields as Record<string, unknown>;
  const cards = Array.isArray(fields.cards)
    ? (fields.cards as AnyEntry[])
        .map(toIndustryCard)
        .filter((c): c is IndustryCard => c !== null)
    : [];
  return {
    title: str(fields.sectionTitle).trim(),
    cards,
  };
}
