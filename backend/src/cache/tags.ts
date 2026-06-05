/**
 * Centralised cache-tag vocabulary. Use these everywhere instead of inline
 * string literals so invalidations stay consistent across services.
 *
 * `purgeTag()` invalidates every cache entry tagged with `tag` via the
 * in-memory CacheStore. Service-layer wrappers that want their fetches
 * memoised call `cache.set(key, value, { ttlSeconds, tags })` directly.
 */
import { invalidateTag } from "@/cache/store";

export const cacheTags = {
  product: (code: string) => `product:${code}`,
  productSearch: () => "products:search",
  category: (code: string) => `category:${code}`,

  contentPage: (slug: string) => `content:page:${slug}`,
  contentAll: () => "content:all",

  homePage: () => "content:home-page",
} as const;

export type CacheTag = ReturnType<(typeof cacheTags)[keyof typeof cacheTags]>;

export function purgeTag(tag: string): void {
  invalidateTag(tag);
}
