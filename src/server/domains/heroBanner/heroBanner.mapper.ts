import type { Asset, Entry, EntrySkeletonType } from "contentful";
import type { HeroBanner, HeroBannerImage } from "@/contracts/heroBanner";

/**
 * Contentful content model (id: "heroBanner")
 *
 *   heading        Symbol/Text      "Heading" — main hero headline
 *   logo           Asset            "Partner logo" rendered above the headline
 *   productImage   Asset            product/feature image on the right
 *   ctaText        Symbol           "CTA Text" — label for the read-more link
 *   ctaUrl         Symbol           optional — link destination (no link rendered if missing)
 */

type AnyEntry = Entry<EntrySkeletonType, "WITHOUT_UNRESOLVABLE_LINKS">;

function assetToImage(asset: Asset | undefined): HeroBannerImage | undefined {
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

export function toHeroBanner(entry: AnyEntry): HeroBanner {
  const fields = entry.fields as Record<string, unknown>;

  const partnerLogo = assetToImage(fields.logo as Asset | undefined);
  const productImage = assetToImage(fields.productImage as Asset | undefined);

  const ctaText = str(fields.ctaText).trim();
  const ctaUrl = str(fields.ctaUrl).trim();
  const readMore: HeroBanner["readMore"] = ctaText
    ? { label: ctaText, href: ctaUrl || "#" }
    : undefined;

  return {
    headline: str(fields.heading).trim(),
    partnerLogo,
    productImage,
    readMore,
  };
}
