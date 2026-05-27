/**
 * Raw OCC (SAP Commerce REST) response shapes.
 * These are intentionally permissive â€” never re-export from a domain layer.
 * Domain mappers translate these into stable `@Types/*` DTOs.
 */

export type OccImage = {
  url?: string;
  format?: string;
  imageType?: string;
  altText?: string;
  width?: number;
  height?: number;
};

export type OccPrice = {
  value?: number;
  currencyIso?: string;
  formattedValue?: string;
};

export type OccCategory = {
  code: string;
  name?: string;
  url?: string;
};

export type OccVariantOption = {
  code: string;
  name?: string;
};

export type OccStock = {
  stockLevelStatus?: string;
  stockLevel?: number;
};

export type OccProduct = {
  code: string;
  name?: string;
  url?: string;
  summary?: string;
  description?: string;
  price?: OccPrice;
  images?: OccImage[];
  categories?: OccCategory[];
  stock?: OccStock;
  variantOptions?: OccVariantOption[];
};

export type OccPagination = {
  totalResults?: number;
  currentPage?: number;
  pageSize?: number;
  totalPages?: number;
};

export type OccProductSearchPage = {
  products?: OccProduct[];
  pagination?: OccPagination;
  facets?: unknown[];
};

export type OccTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};
