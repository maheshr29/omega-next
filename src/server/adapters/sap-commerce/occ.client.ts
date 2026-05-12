import "server-only";
import { getEnv } from "@/server/config/env";
import { UpstreamError } from "@/server/errors";
import { logger } from "@/server/observability/logger";
import type { OccTokenResponse } from "./occ.types";

type TokenCacheEntry = {
  accessToken: string;
  expiresAt: number;
};

const DEFAULT_TIMEOUT_MS = 8_000;

let tokenCache: TokenCacheEntry | null = null;
let inFlightToken: Promise<TokenCacheEntry> | null = null;

function withTimeout(
  external: AbortSignal | undefined,
  ms: number,
): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error("timeout")), ms);
  const onExternalAbort = () => controller.abort(external?.reason);
  external?.addEventListener("abort", onExternalAbort, { once: true });
  return {
    signal: controller.signal,
    cancel: () => {
      clearTimeout(timer);
      external?.removeEventListener("abort", onExternalAbort);
    },
  };
}

async function fetchToken(): Promise<TokenCacheEntry> {
  const env = getEnv();
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: env.SAP_COMMERCE_CLIENT_ID,
    client_secret: env.SAP_COMMERCE_CLIENT_SECRET,
  });

  const { signal, cancel } = withTimeout(undefined, DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch(env.SAP_COMMERCE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
      signal,
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
  } catch (err) {
    if (err instanceof UpstreamError) throw err;
    throw new UpstreamError(
      "sap-commerce",
      502,
      `OAuth token request failed: ${(err as Error).message}`,
      err,
    );
  } finally {
    cancel();
  }
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
  timeoutMs?: number;
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

async function rawFetch(
  url: URL,
  token: string,
  opts: OccRequestOptions,
  signal: AbortSignal,
) {
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    signal,
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
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const attempt = async (forceRefresh: boolean) => {
    const token = await getAccessToken(forceRefresh);
    const { signal, cancel } = withTimeout(opts.signal, timeoutMs);
    try {
      return await rawFetch(url, token, opts, signal);
    } finally {
      cancel();
    }
  };

  let res: Response;
  try {
    res = await attempt(false);
  } catch (err) {
    throw new UpstreamError(
      "sap-commerce",
      502,
      `${path} → ${(err as Error).message}`,
      err,
    );
  }

  if (res.status === 401) {
    logger.warn({ path }, "occ.token-rejected, retrying with fresh token");
    tokenCache = null;
    try {
      res = await attempt(true);
    } catch (err) {
      throw new UpstreamError(
        "sap-commerce",
        502,
        `${path} → ${(err as Error).message}`,
        err,
      );
    }
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
