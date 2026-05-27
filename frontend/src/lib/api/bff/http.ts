import type { BffErrorBody } from "@shared/types/error";

export class BffClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly requestId?: string,
  ) {
    super(message);
    this.name = "BffClientError";
  }
}

function backendBase(): string {
  const explicit = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  // Local-dev fallback: the backend runs on :4000 by default.
  return "http://localhost:4000";
}

export type BffFetchInit = RequestInit & {
  searchParams?: Record<string, string | number | undefined>;
};

export async function bffFetch<T>(
  path: string,
  init?: BffFetchInit,
): Promise<T> {
  const url = new URL(
    `/bff${path.startsWith("/") ? path : `/${path}`}`,
    backendBase(),
  );
  if (init?.searchParams) {
    for (const [k, v] of Object.entries(init.searchParams)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url, init);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as BffErrorBody | null;
    throw new BffClientError(
      body?.error.message ?? `Request failed (${res.status})`,
      res.status,
      body?.error.code ?? "BFF_ERROR",
      body?.error.requestId,
    );
  }
  return (await res.json()) as T;
}
