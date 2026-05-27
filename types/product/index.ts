/**
 * Public BFF contract for product data.
 * Both server domains and client code import from here.
 * Never reference upstream (SAP / OCC) shapes from this file.
 */

export type Money = {
  amount: number;
  currency: string;
  formatted?: string;
};

export type ProductImage = {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type ProductSummary = {
  code: string;
  name: string;
  slug?: string;
  price?: Money;
  image?: ProductImage;
  inStock: boolean;
};

export type Product = ProductSummary & {
  description?: string;
  images: ProductImage[];
  categories: { code: string; name: string }[];
  variants?: { code: string; name: string }[];
};

export type ProductSearchResult = {
  items: ProductSummary[];
  total: number;
  page: number;
  pageSize: number;
};

export type ProductSearchParams = {
  q?: string;
  category?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
};
