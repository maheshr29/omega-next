import type { Asset, Entry, EntrySkeletonType } from "contentful";
import type {
  ContentBlock,
  ContentImage,
  PageContent,
} from "@Types/content";

type FieldsOf<T> = T extends EntrySkeletonType<infer F> ? F : never;
type AnyEntry = Entry<EntrySkeletonType, "WITHOUT_UNRESOLVABLE_LINKS">;

function assetToImage(asset: Asset | undefined): ContentImage | undefined {
  if (!asset?.fields?.file) return undefined;
  const file = asset.fields.file;
  const url = typeof file.url === "string" ? file.url : "";
  if (!url) return undefined;
  const details =
    file.details && typeof file.details === "object"
      ? (file.details as { image?: { width?: number; height?: number } })
      : undefined;
  return {
    url: url.startsWith("//") ? `https:${url}` : url,
    alt:
      typeof asset.fields.title === "string" ? asset.fields.title : undefined,
    width: details?.image?.width,
    height: details?.image?.height,
  };
}

function mapBlock(entry: AnyEntry): ContentBlock | null {
  const contentType = entry.sys.contentType?.sys.id;
  const fields = entry.fields as Record<string, unknown>;

  switch (contentType) {
    case "richText":
      return { type: "richText", html: String(fields.html ?? "") };
    case "imageBlock": {
      const image = assetToImage(fields.image as Asset | undefined);
      return image ? { type: "image", image } : null;
    }
    case "productCarousel":
      return {
        type: "productCarousel",
        title: typeof fields.title === "string" ? fields.title : undefined,
        productCodes: Array.isArray(fields.productCodes)
          ? (fields.productCodes as unknown[]).map(String)
          : [],
      };
    case "callToAction":
      return {
        type: "callToAction",
        label: String(fields.label ?? ""),
        href: String(fields.href ?? "#"),
      };
    default:
      return null;
  }
}

export function toPageContent(entry: AnyEntry): PageContent {
  const fields = entry.fields as FieldsOf<EntrySkeletonType> &
    Record<string, unknown>;

  const heroEntry = fields.hero as AnyEntry | undefined;
  const heroFields = (heroEntry?.fields ?? {}) as Record<string, unknown>;
  const heroImage = assetToImage(heroFields.image as Asset | undefined);

  const bodyRaw = Array.isArray(fields.body) ? (fields.body as AnyEntry[]) : [];
  const body = bodyRaw
    .map(mapBlock)
    .filter((b): b is ContentBlock => b !== null);

  return {
    id: entry.sys.id,
    slug: String(fields.slug ?? ""),
    title: String(fields.title ?? ""),
    seo: {
      title: typeof fields.seoTitle === "string" ? fields.seoTitle : undefined,
      description:
        typeof fields.seoDescription === "string"
          ? fields.seoDescription
          : undefined,
    },
    hero: heroEntry
      ? {
          headline:
            typeof heroFields.headline === "string"
              ? heroFields.headline
              : undefined,
          subline:
            typeof heroFields.subline === "string"
              ? heroFields.subline
              : undefined,
          image: heroImage,
          cta:
            typeof heroFields.ctaLabel === "string" &&
            typeof heroFields.ctaHref === "string"
              ? { label: heroFields.ctaLabel, href: heroFields.ctaHref }
              : undefined,
        }
      : undefined,
    body,
  };
}
