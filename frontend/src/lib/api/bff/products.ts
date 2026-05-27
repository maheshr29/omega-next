import type {
  Product,
  ProductSearchParams,
  ProductSearchResult,
} from "@shared/types/product";
import { bffFetch } from "./http";

export const productsApi = {
  search: (params: ProductSearchParams) =>
    bffFetch<ProductSearchResult>("/products", { searchParams: params }),
  get: (code: string) =>
    bffFetch<Product>(`/products/${encodeURIComponent(code)}`),
} as const;
