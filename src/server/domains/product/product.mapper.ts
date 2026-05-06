import { getEnv } from "@/server/config/env";
import type {
  Product,
  ProductImage,
  ProductSearchResult,
  ProductSummary,
} from "@/contracts/product";
import type {
  OccImage,
  OccProduct,
  OccProductSearchPage,
} from "@/server/adapters/sap-commerce/occ.types";

function absoluteImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  const base = getEnv().SAP_COMMERCE_BASE_URL.replace(/\/occ\/v\d+\/?$/, "");
  return `${base.replace(/\/+$/, "")}${url.startsWith("/") ? url : `/${url}`}`;
}

function pickPrimaryImage(images: OccImage[] | undefined): ProductImage | undefined {
  if (!images?.length) return undefined;
  const primary =
    images.find((i) => i.imageType === "PRIMARY" && i.format === "product") ??
    images.find((i) => i.imageType === "PRIMARY") ??
    images[0];
  const url = absoluteImageUrl(primary.url);
  if (!url) return undefined;
  return {
    url,
    alt: primary.altText,
    width: primary.width,
    height: primary.height,
  };
}

export function toProductSummary(p: OccProduct): ProductSummary {
  const stockStatus = p.stock?.stockLevelStatus;
  return {
    code: p.code,
    name: p.name ?? p.code,
    slug: p.url,
    price:
      p.price?.value !== undefined
        ? {
            amount: p.price.value,
            currency: p.price.currencyIso ?? "USD",
            formatted: p.price.formattedValue,
          }
        : undefined,
    image: pickPrimaryImage(p.images),
    inStock:
      stockStatus === "inStock" ||
      (typeof p.stock?.stockLevel === "number" && p.stock.stockLevel > 0),
  };
}

export function toProduct(p: OccProduct): Product {
  return {
    ...toProductSummary(p),
    description: p.description ?? p.summary,
    images:
      p.images
        ?.filter((i) => i.format === "product" || i.format === "zoom")
        .map((i) => ({
          url: absoluteImageUrl(i.url) ?? "",
          alt: i.altText,
          width: i.width,
          height: i.height,
        }))
        .filter((i) => i.url) ?? [],
    categories:
      p.categories?.map((c) => ({ code: c.code, name: c.name ?? c.code })) ?? [],
    variants: p.variantOptions?.map((v) => ({
      code: v.code,
      name: v.name ?? v.code,
    })),
  };
}

export function toProductSearchResult(
  page: OccProductSearchPage,
): ProductSearchResult {
  return {
    items: (page.products ?? []).map(toProductSummary),
    total: page.pagination?.totalResults ?? 0,
    page: page.pagination?.currentPage ?? 0,
    pageSize: page.pagination?.pageSize ?? 0,
  };
}
