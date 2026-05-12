import "server-only";
import { revalidateTag } from "next/cache";

/**
 * Centralised cache-tag vocabulary. Use these everywhere instead of inline
 * string literals so invalidations stay consistent across services.
 */
export const cacheTags = {
  product: (code: string) => `product:${code}`,
  productSearch: () => "products:search",
  category: (code: string) => `category:${code}`,

  contentPage: (slug: string) => `content:page:${slug}`,
  contentAll: () => "content:all",

  header: () => "content:header",
  footer: () => "content:footer",
  heroBanner: () => "content:hero-banner",
  helpSection: () => "content:help-section",
  industrySection: () => "content:industry-section",
} as const;

export type CacheTag = ReturnType<(typeof cacheTags)[keyof typeof cacheTags]>;

/**
 * Purge a cache tag immediately. Wraps Next 16's `revalidateTag(tag, profile)`
 * with `{ expire: 0 }` so callers don't need to know the new signature.
 */
export function purgeTag(tag: string): void {
  revalidateTag(tag, { expire: 0 });
}
