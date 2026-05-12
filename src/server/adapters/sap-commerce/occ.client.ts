import "server-only";
import { getEnv } from "@/server/config/env";
import { UpstreamError } from "@/server/errors";
import { logger } from "@/server/observability/logger";
import type { OccTokenResponse } from "./occ.types";

type TokenCacheEntry = {
  accessToken: string;
  expiresAt: number;
};

let tokenCache: TokenCacheEntry | null = null;
let inFlightToken: Promise<TokenCacheEntry> | null = null;

async function fetchToken(): Promise<TokenCacheEntry> {
  const env = getEnv();
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: env.SAP_COMMERCE_CLIENT_ID,
    client_secret: env.SAP_COMMERCE_CLIENT_SECRET,
  });

  const res = await fetch(env.SAP_COMMERCE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new UpstreamError(
      "sap-commerce",
      res.status,
      `OAuth token request failed (${res.status})`,
    );
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

export type OccRequestOptions = {
  query?: Record<string, string | number | boolean | undefined>;
  revalidateSeconds?: number;
  tags?: string[];
  signal?: AbortSignal;
};

function buildUrl(path: string, query?: OccRequestOptions["query"]): URL {
  const env = getEnv();
  const base = env.SAP_COMMERCE_BASE_URL.replace(/\/+$/, "");
  const site = env.SAP_COMMERCE_BASE_SITE_ID;
  const url = new URL(
    `${base}/${site}${path.startsWith("/") ? path : `/${path}`}`,
  );
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  return url;
}

async function rawFetch(url: URL, token: string, opts: OccRequestOptions) {
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    signal: opts.signal,
    next:
      opts.revalidateSeconds !== undefined || opts.tags
        ? { revalidate: opts.revalidateSeconds, tags: opts.tags }
        : undefined,
  });
}

export async function occFetch<T>(
  path: string,
  opts: OccRequestOptions = {},
): Promise<T> {
  const url = buildUrl(path, opts.query);
  let token = await getAccessToken();
  let res = await rawFetch(url, token, opts);

  if (res.status === 401) {
    logger.warn({ path }, "occ.token-rejected, retrying with fresh token");
    tokenCache = null;
    token = await getAccessToken(true);
    res = await rawFetch(url, token, opts);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new UpstreamError(
      "sap-commerce",
      res.status,
      `${path} → ${res.status} ${text.slice(0, 200)}`,
    );
  }

  return (await res.json()) as T;
}
