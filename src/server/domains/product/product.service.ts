import "server-only";
import { occFetch } from "@/server/adapters/sap-commerce/occ.client";
import type {
  OccProduct,
  OccProductSearchPage,
} from "@/server/adapters/sap-commerce/occ.types";
import { cacheTags } from "@/server/cache/tags";
import { getEnv } from "@/server/config/env";
import { NotFoundError, UpstreamError } from "@/server/errors";
import {
  toProduct,
  toProductSearchResult,
} from "@/server/domains/product/product.mapper";
import type {
  Product,
  ProductSearchParams,
  ProductSearchResult,
} from "@/contracts/product";

const PRODUCT_FIELDS =
  "FULL,images(FULL),categories(FULL),variantOptions(FULL),price(FULL),stock(FULL)";

const SUMMARY_FIELDS =
  "products(code,name,url,price(FULL),images(DEFAULT),stock(stockLevelStatus,stockLevel)),pagination,facets";

export async function getProductByCode(code: string): Promise<Product> {
  const env = getEnv();
  try {
    const data = await occFetch<OccProduct>(
      `/products/${encodeURIComponent(code)}`,
      {
        query: { fields: PRODUCT_FIELDS },
        revalidateSeconds: env.BFF_PRODUCT_REVALIDATE_SECONDS,
        tags: [cacheTags.product(code)],
      },
    );
    return toProduct(data);
  } catch (err) {
    if (err instanceof UpstreamError && err.status === 404) {
      throw new NotFoundError(`Product "${code}" not found`);
    }
    throw err;
  }
}

export async function searchProducts(
  params: ProductSearchParams,
): Promise<ProductSearchResult> {
  const env = getEnv();
  const queryString = [
    params.q,
    params.category ? `:category:${params.category}` : "",
  ]
    .filter(Boolean)
    .join("");

  const data = await occFetch<OccProductSearchPage>("/products/search", {
    query: {
      query: queryString || undefined,
      currentPage: params.page,
      pageSize: params.pageSize,
      sort: params.sort,
      fields: SUMMARY_FIELDS,
    },
    revalidateSeconds: env.BFF_PRODUCT_REVALIDATE_SECONDS,
    tags: [cacheTags.productSearch()],
  });
  return toProductSearchResult(data);
}
