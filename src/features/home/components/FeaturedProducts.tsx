import { connection } from "next/server";
import { FeaturedProductsCarousel } from "@/features/home/components/FeaturedProductsCarousel";
import { getProductByCode } from "@/server/domains/product/product.service";
import { logger } from "@/server/observability/logger";
import type { Product } from "@/contracts/product";

const FEATURED_CODES = ["HTC-030", "HTC-060", "HTC-120"] as const;

export async function FeaturedProducts() {
  // Opt out of static pre-rendering. The Vercel build environment cannot
  // always reach the SAP host (e.g. IP-allowlisted dev endpoints), so we
  // render at request time — the underlying fetch is still cached for
  // BFF_PRODUCT_REVALIDATE_SECONDS via Next.js's data cache.
  await connection();

  const settled = await Promise.allSettled(
    FEATURED_CODES.map((code) => getProductByCode(code)),
  );

  const products: Product[] = settled.flatMap((result, i) => {
    if (result.status === "fulfilled") return [result.value];
    logger.warn(
      { err: result.reason, code: FEATURED_CODES[i] },
      "featuredProducts.fetch-failed",
    );
    return [];
  });

  if (products.length === 0) return null;
  return <FeaturedProductsCarousel products={products} />;
}
