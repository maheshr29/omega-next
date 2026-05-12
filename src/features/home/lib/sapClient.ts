"use client";

import type { Product, ProductImage } from "@/contracts/product";

// WARNING: these credentials ship to the browser. Anyone can read them in DevTools
// and use them to call SAP as this app. Only acceptable for short-lived demos.
const SAP_BASE_URL = "https://dev1-api-hybris.omega.com/oews/v2";
const SAP_BASE_SITE_ID = "omegaengineeringus";
const SAP_TOKEN_URL =
  "https://dev1-api-hybris.omega.com/authorizationserver/oauth/token";
const SAP_CLIENT_ID = "dwyeromegacpiId";
const SAP_CLIENT_SECRET = "dwyeromegacpiId1";

const PRODUCT_FIELDS =
  "FULL,images(FULL),categories(FULL),variantOptions(FULL),price(FULL),stock(FULL)";

type TokenCacheEntry = { accessToken: string; expiresAt: number };
let tokenCache: TokenCacheEntry | null = null;
let inFlightToken: Promise<TokenCacheEntry> | null = null;

type OccTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

async function fetchToken(): Promise<TokenCacheEntry> {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: SAP_CLIENT_ID,
    client_secret: SAP_CLIENT_SECRET,
  });
  const res = await fetch(SAP_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    throw new Error(`OAuth token request failed (${res.status})`);
  }
  const json = (await res.json()) as OccTokenResponse;
  return {
    accessToken: json.access_token,
    expiresAt: Date.now() + (json.expires_in - 30) * 1000,
  };
}

async function getAccessToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.accessToken;
  }
  if (!inFlightToken) {
    inFlightToken = fetchToken().finally(() => {
      inFlightToken = null;
    });
  }
  tokenCache = await inFlightToken;
  return tokenCache.accessToken;
}

type OccImage = {
  url?: string;
  altText?: string;
  imageType?: string;
  format?: string;
  width?: number;
  height?: number;
};

type OccProduct = {
  code: string;
  name?: string;
  url?: string;
  description?: string;
  summary?: string;
  price?: { value?: number; currencyIso?: string; formattedValue?: string };
  stock?: { stockLevelStatus?: string; stockLevel?: number };
  images?: OccImage[];
  categories?: { code: string; name?: string }[];
  variantOptions?: { code: string; name?: string }[];
};

function absoluteImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const embedded = url.match(/https?:\/\/.+$/i);
  if (embedded) return embedded[0];
  const base = SAP_BASE_URL.replace(/\/occ\/v\d+\/?$/, "").replace(/\/+$/, "");
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
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

function toProduct(p: OccProduct): Product {
  const stockStatus = p.stock?.stockLevelStatus;
  const inStock =
    stockStatus === "inStock" ||
    (typeof p.stock?.stockLevel === "number" && p.stock.stockLevel > 0);
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
    inStock,
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

async function rawProductFetch(code: string, token: string): Promise<Response> {
  const url = new URL(
    `${SAP_BASE_URL.replace(/\/+$/, "")}/${SAP_BASE_SITE_ID}/products/${encodeURIComponent(code)}`,
  );
  url.searchParams.set("fields", PRODUCT_FIELDS);
  return fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
}

export async function fetchProductByCode(code: string): Promise<Product> {
  let token = await getAccessToken();
  let res = await rawProductFetch(code, token);

  if (res.status === 401) {
    tokenCache = null;
    token = await getAccessToken(true);
    res = await rawProductFetch(code, token);
  }

  if (!res.ok) {
    throw new Error(`Product "${code}" fetch failed (${res.status})`);
  }
  const data = (await res.json()) as OccProduct;
  return toProduct(data);
}
