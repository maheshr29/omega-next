import type { Asset, Entry, EntrySkeletonType } from "contentful";
import type {
  Footer,
  FooterBottom,
  FooterConnect,
  FooterImage,
  FooterLink,
  FooterLinkGroup,
  FooterSocialLink,
  FooterTechnologyClub,
} from "@Types/footer";

/**
 * Contentful content model (id: "footer")
 *
 *   name              Symbol         // internal
 *   quickLinks        Reference â†’ quickLinks   { title, links[] â†’ navItem }
 *   columns           Reference[] â†’ footerColumn   { title, links[] â†’ navItem }
 *   connectWithUs     Reference â†’ connectWithUs
 *                       { title, socialLinks[] â†’ socialLink,
 *                         technologyClubTitle, technologyClubDescription,
 *                         technologyClubLinkLabel, technologyClubLinkUrl,
 *                         feedbackLinkLabel, feedbackLinkUrl }
 *   footerBottom      Reference â†’ footerBottom
 *                       { copyrightText, copyrightUrl, legalLinks[] â†’ navItem }
 *
 *   navItem fields:    label (Symbol), url (Symbol, optional), external (Boolean, optional)
 *   socialLink fields: name (Symbol), url (Symbol), icon (Asset)
 */

type AnyEntry = Entry<EntrySkeletonType, "WITHOUT_UNRESOLVABLE_LINKS">;

function assetToImage(asset: Asset | undefined): FooterImage | undefined {
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

function bool(v: unknown): boolean | undefined {
  return typeof v === "boolean" ? v : undefined;
}

function navLinkFromEntry(entry: AnyEntry | undefined): FooterLink | null {
  if (!entry) return null;
  const fields = entry.fields as Record<string, unknown>;
  const label = str(fields.label);
  if (!label) return null;
  return {
    label,
    href: str(fields.url) || str(fields.href) || undefined,
    external: bool(fields.external),
  };
}

function navLinksFromArray(value: unknown): FooterLink[] {
  if (!Array.isArray(value)) return [];
  return (value as AnyEntry[])
    .map(navLinkFromEntry)
    .filter((l): l is FooterLink => l !== null);
}

function linkGroupFromEntry(
  entry: AnyEntry | undefined,
): FooterLinkGroup | null {
  if (!entry) return null;
  const fields = entry.fields as Record<string, unknown>;
  const title = str(fields.title);
  if (!title) return null;
  const links = navLinksFromArray(fields.links);
  return { title, links };
}

function socialLinkFromEntry(
  entry: AnyEntry | undefined,
): FooterSocialLink | null {
  if (!entry) return null;
  const fields = entry.fields as Record<string, unknown>;
  const name = str(fields.name) || str(fields.label);
  const url = str(fields.url);
  if (!name || !url) return null;
  return {
    name,
    url,
    icon: assetToImage(fields.icon as Asset | undefined),
  };
}

function buildTechnologyClub(
  fields: Record<string, unknown>,
): FooterTechnologyClub | undefined {
  const title = str(fields.technologyClubTitle);
  if (!title) return undefined;
  const description = str(fields.technologyClubDescription) || undefined;
  const linkLabel = str(fields.technologyClubLinkLabel);
  const linkUrl = str(fields.technologyClubLinkUrl);
  return {
    title,
    description,
    link:
      linkLabel && linkUrl
        ? {
            label: linkLabel,
            href: linkUrl,
            external: /^https?:\/\//i.test(linkUrl),
          }
        : undefined,
  };
}

function connectFromEntry(
  entry: AnyEntry | undefined,
): FooterConnect | undefined {
  if (!entry) return undefined;
  const fields = entry.fields as Record<string, unknown>;
  const title = str(fields.title, "Connect With Us");
  const socialLinks = Array.isArray(fields.socialLinks)
    ? (fields.socialLinks as AnyEntry[])
        .map(socialLinkFromEntry)
        .filter((s): s is FooterSocialLink => s !== null)
    : [];
  const technologyClub = buildTechnologyClub(fields);
  const feedbackLabel = str(fields.feedbackLinkLabel);
  const feedbackUrl = str(fields.feedbackLinkUrl);
  return {
    title,
    socialLinks,
    technologyClub,
    feedbackLink:
      feedbackLabel && feedbackUrl
        ? {
            label: feedbackLabel,
            href: feedbackUrl,
            external: /^https?:\/\//i.test(feedbackUrl),
          }
        : undefined,
  };
}

function bottomFromEntry(
  entry: AnyEntry | undefined,
): FooterBottom | undefined {
  if (!entry) return undefined;
  const fields = entry.fields as Record<string, unknown>;
  const text = str(fields.copyrightText);
  if (!text) return undefined;
  return {
    copyright: {
      text,
      href: str(fields.copyrightUrl) || undefined,
    },
    legalLinks: navLinksFromArray(fields.legalLinks),
  };
}

export function toFooter(entry: AnyEntry): Footer {
  const fields = entry.fields as Record<string, unknown>;
  const quickLinks = linkGroupFromEntry(
    fields.quickLinks as AnyEntry | undefined,
  );
  const columns = Array.isArray(fields.columns)
    ? (fields.columns as AnyEntry[])
        .map(linkGroupFromEntry)
        .filter((g): g is FooterLinkGroup => g !== null)
    : [];
  const connect = connectFromEntry(
    fields.connectWithUs as AnyEntry | undefined,
  );
  const bottom = bottomFromEntry(fields.footerBottom as AnyEntry | undefined);
  return {
    quickLinks: quickLinks ?? undefined,
    columns,
    connect,
    bottom,
  };
}
