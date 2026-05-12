import { FeaturedProductsCarousel } from "@/features/home/components/FeaturedProductsCarousel";
import { getProductByCode } from "@/server/domains/product/product.service";
import { logger } from "@/server/observability/logger";
import type { Product } from "@/contracts/product";

const FEATURED_CODES = ["HTC-030", "HTC-060", "HTC-120"] as const;

async function fetchFeatured(): Promise<Product[]> {
  const settled = await Promise.allSettled(
    FEATURED_CODES.map((code) => getProductByCode(code)),
  );
  return settled.flatMap((r, i) => {
    if (r.status === "fulfilled") return [r.value];
    logger.warn(
      { err: r.reason, code: FEATURED_CODES[i] },
      "featured-products.fetch-failed",
    );
    return [];
  });
}

export async function FeaturedProducts() {
  const products = await fetchFeatured();

  if (process.env.NODE_ENV !== "production") {
    console.log("[featuredProducts] fetched products:");
    console.dir(products, { depth: 6, colors: true });
  } else {
    logger.info(
      {
        requestedCodes: FEATURED_CODES,
        fetchedCount: products.length,
        codes: products.map((p) => p.code),
      },
      "featured-products.fetched",
    );
  }

  if (products.length === 0) return null;
  return <FeaturedProductsCarousel products={products} />;
}
