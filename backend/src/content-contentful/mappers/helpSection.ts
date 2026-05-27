import type { Asset, Entry, EntrySkeletonType } from "contentful";
import type {
  HelpCard,
  HelpSection,
  HelpSectionImage,
} from "@Types/helpSection";

/**
 * Contentful content model (id: "helpSection")
 *
 *   sectionTitle      Symbol/Text       headline above the card grid
 *   sectionSubtitle   Symbol/Text       optional supporting text
 *   cards             Reference[] â†’ helpCard
 *
 * helpCard fields:
 *   eyebrowTitle      Symbol            small uppercase label (e.g. "CONTACT US")
 *   heading           Symbol/Text       bold card heading
 *   description       Text              long-form text (used by the "story" card)
 *   image             Asset             large illustration / photo
 *   icon              Asset             small icon for compact cards
 *   href / url        Symbol (optional) link destination â€” if absent the component
 *                                       falls back to its hardcoded route per position.
 */

type AnyEntry = Entry<EntrySkeletonType, "WITHOUT_UNRESOLVABLE_LINKS">;

function assetToImage(asset: Asset | undefined): HelpSectionImage | undefined {
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

function toHelpCard(entry: AnyEntry | undefined): HelpCard | null {
  if (!entry) return null;
  const fields = entry.fields as Record<string, unknown>;
  const eyebrow = str(fields.eyebrowTitle).trim() || undefined;
  const heading = str(fields.heading).trim() || undefined;
  const description = str(fields.description).trim() || undefined;
  const image = assetToImage(fields.image as Asset | undefined);
  const icon = assetToImage(fields.icon as Asset | undefined);
  const href =
    str(fields.href).trim() ||
    str(fields.url).trim() ||
    str(fields.linkUrl).trim() ||
    undefined;
  if (!eyebrow && !heading && !description && !image && !icon) return null;
  return { eyebrow, heading, description, image, icon, href };
}

export function toHelpSection(entry: AnyEntry): HelpSection {
  const fields = entry.fields as Record<string, unknown>;
  const cards = Array.isArray(fields.cards)
    ? (fields.cards as AnyEntry[])
        .map(toHelpCard)
        .filter((c): c is HelpCard => c !== null)
    : [];
  return {
    title: str(fields.sectionTitle).trim(),
    subtitle: str(fields.sectionSubtitle).trim() || undefined,
    cards,
  };
}
