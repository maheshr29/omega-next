import type { Asset, Entry, EntrySkeletonType } from "contentful";
import type {
  Header,
  HeaderAnnouncement,
  HeaderImage,
  HeaderLink,
  HeaderLocaleOption,
  HeaderPhone,
} from "@Types/header";

/**
 * Contentful content model (id: "header")
 *
 *   name                  Symbol           // internal label
 *   logo                  Asset
 *   logoHref              Symbol           default "/"
 *   phoneNumber           Symbol           "1-800-663-4209"
 *   phoneHref             Symbol           derived from phoneNumber if absent
 *   announcementText      Symbol/Text
 *   announcementLinkLabel Symbol
 *   announcementLinkUrl   Symbol
 *   allProductsNav        Reference â†’ navItem      (the red "All Products" button)
 *   navigationItems       Reference[] â†’ navItem    (top-row nav)
 *   locales               Reference[] â†’ locale
 *   activeLocaleCode      Symbol           optional
 *   searchPlaceholder     Symbol           optional, defaults to "Search DwyerOmega"
 *   searchAction          Symbol           optional, defaults to "/search"
 *   utilityLinks          Reference[] â†’ navItem    optional (e.g. Contact Us)
 *
 *   navItem fields:        label (Symbol), url (Symbol, optional),
 *                          external (Boolean, optional),
 *                          children (Reference[] â†’ navItem, optional)
 *   locale fields:         label (Symbol), url (Symbol),
 *                          code (Symbol, optional), flag (Asset, optional)
 *
 * Every field is optional in this mapper â€” if it's missing the header still
 * renders with safe defaults. Update both the contract and this mapper if the
 * Contentful schema changes.
 */

type AnyEntry = Entry<EntrySkeletonType, "WITHOUT_UNRESOLVABLE_LINKS">;

function assetToImage(asset: Asset | undefined): HeaderImage | undefined {
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

function navItemFromEntry(entry: AnyEntry | undefined): HeaderLink | null {
  if (!entry) return null;
  const fields = entry.fields as Record<string, unknown>;
  const label = str(fields.label);
  if (!label) return null;
  const href = str(fields.url) || str(fields.href) || undefined;
  const childrenRaw = Array.isArray(fields.children)
    ? (fields.children as AnyEntry[])
    : [];
  const children = childrenRaw
    .map(navItemFromEntry)
    .filter((c): c is HeaderLink => c !== null);
  return {
    label,
    href,
    external: bool(fields.external),
    children: children.length ? children : undefined,
  };
}

function localeFromEntry(entry: AnyEntry): HeaderLocaleOption | null {
  const fields = entry.fields as Record<string, unknown>;
  const label = str(fields.label);
  const href = str(fields.url) || str(fields.href);
  if (!label || !href) return null;
  const explicitCode = str(fields.code);
  const derivedCode = href.match(/\/([a-z]{2})-([a-z]{2})\b/i);
  return {
    code:
      explicitCode ||
      (derivedCode
        ? `${derivedCode[1]}-${derivedCode[2]}`.toLowerCase()
        : undefined),
    label,
    href,
    flag: assetToImage(fields.flag as Asset | undefined),
  };
}

function derivePhoneHref(number: string, explicit: string): string {
  if (explicit) return explicit;
  const digits = number.replace(/\D/g, "");
  return digits ? `tel:${digits}` : "#";
}

function buildAnnouncement(
  fields: Record<string, unknown>,
): HeaderAnnouncement | undefined {
  const text = str(fields.announcementText);
  if (!text) return undefined;
  const linkText = str(fields.announcementLinkLabel);
  const linkHref = str(fields.announcementLinkUrl);
  return {
    text,
    link:
      linkText && linkHref ? { label: linkText, href: linkHref } : undefined,
  };
}

function buildPhone(fields: Record<string, unknown>): HeaderPhone | undefined {
  const number = str(fields.phoneNumber);
  if (!number) return undefined;
  return {
    number,
    href: derivePhoneHref(number, str(fields.phoneHref)),
  };
}

const FALLBACK_LOGO: HeaderImage = {
  url: "",
  alt: "DwyerOmega",
};

export function toHeader(entry: AnyEntry): Header {
  const fields = entry.fields as Record<string, unknown>;

  const logo = assetToImage(fields.logo as Asset | undefined) ?? FALLBACK_LOGO;
  const logoHref = str(fields.logoHref, "/");

  const utilityLinks = Array.isArray(fields.utilityLinks)
    ? (fields.utilityLinks as AnyEntry[])
        .map(navItemFromEntry)
        .filter((l): l is HeaderLink => l !== null)
    : [];

  const allProductsNav = navItemFromEntry(
    fields.allProductsNav as AnyEntry | undefined,
  );

  const mainNav = Array.isArray(fields.navigationItems)
    ? (fields.navigationItems as AnyEntry[])
        .map(navItemFromEntry)
        .filter((l): l is HeaderLink => l !== null)
    : [];

  const locales = Array.isArray(fields.locales)
    ? (fields.locales as AnyEntry[])
        .map(localeFromEntry)
        .filter((l): l is HeaderLocaleOption => l !== null)
    : [];

  return {
    logo,
    logoHref,
    phone: buildPhone(fields),
    announcement: buildAnnouncement(fields),
    searchPlaceholder: str(fields.searchPlaceholder, "Search DwyerOmega"),
    searchAction: str(fields.searchAction, "/search"),
    utilityLinks,
    allProductsNav: allProductsNav ?? undefined,
    mainNav,
    locales,
    activeLocaleCode: str(fields.activeLocaleCode) || undefined,
  };
}
