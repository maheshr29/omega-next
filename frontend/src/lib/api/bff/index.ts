import { contentApi } from "./content";
import { homepageApi } from "./homepage";
import { productsApi } from "./products";

/**
 * Aggregated BFF client, namespaced by resource. Prefer the resource-specific
 * module (e.g. `productsApi` from "@/lib/api/bff/products") in feature code so
 * import graphs stay scoped. Use `bff.<resource>` for ad-hoc callers.
 *
 * Example:
 *   import { bff } from "@/lib/api/bff";
 *   const product = await bff.products.get("HTC-030");
 */
export const bff = {
  products: productsApi,
  content: contentApi,
  homepage: homepageApi,
} as const;

export { BffClientError } from "./http";
export { contentApi, homepageApi, productsApi };
