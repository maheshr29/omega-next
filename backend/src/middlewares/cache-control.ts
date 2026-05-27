import type { MiddlewareHandler } from "hono";

/**
 * Sets HTTP cache headers on GET responses so Vercel's edge cache (and any
 * CDN in front of the backend) can hold responses across function
 * invocations. Webhook-driven invalidation happens via `purgeTag()` in
 * `backend/src/cache/tags.ts`; the s-maxage value here is the upper bound
 * before stale-while-revalidate kicks in.
 */
export const bffCacheControl: MiddlewareHandler = async (c, next) => {
  await next();
  if (c.req.method === "GET" && c.res.status === 200) {
    c.res.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600",
    );
  }
};
