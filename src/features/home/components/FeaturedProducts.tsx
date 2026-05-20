"use client";

import { useEffect, useState } from "react";
import type { FeaturedProductsSection } from "@/contracts/featuredProductsSection";
import { FeaturedProductsCarousel } from "@/features/home/components/FeaturedProductsCarousel";
import { FeaturedProductsFallback } from "@/features/home/components/FeaturedProductsFallback";
import { productsApi } from "@/lib/api/bff/products";
import type { Product } from "@/contracts/product";

const FEATURED_CODES = ["HTC-030", "HTC-060", "HTC-120"] as const;
const DEFAULT_TITLE = "Featured Products";
const DEFAULT_CTA = "Browse all Products";

type FeaturedProductsProps = {
  data?: FeaturedProductsSection;
};

export function FeaturedProducts({ data: section }: FeaturedProductsProps = {}) {
  const [products, setProducts] = useState<Product[] | null>(null);

  const title = section?.title?.trim() || DEFAULT_TITLE;
  const ctaText = section?.ctaText?.trim() || DEFAULT_CTA;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const settled = await Promise.allSettled(
        FEATURED_CODES.map((code) => productsApi.get(code)),
      );
      if (cancelled) return;
      const ok = settled.flatMap((r, i) => {
        if (r.status === "fulfilled") return [r.value];
        console.warn(
          `[FeaturedProducts] fetch failed for ${FEATURED_CODES[i]}`,
          r.reason,
        );
        return [];
      });
      setProducts(ok);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (products === null) return <FeaturedProductsFallback title={title} />;
  if (products.length === 0) {
    return (
      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-10 text-center text-2xl font-bold text-zinc-900">
            {title}
          </h2>
        </div>
      </section>
    );
  }
  return (
    <FeaturedProductsCarousel
      products={products}
      title={title}
      ctaText={ctaText}
    />
  );
}
