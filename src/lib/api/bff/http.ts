import type { BffErrorBody } from "@/contracts/error";

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

function bffBase(): string {
  if (typeof window !== "undefined") return "";
  const explicit = process.env.NEXT_PUBLIC_BFF_BASE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const port = process.env.PORT ?? "3000";
  return `http://127.0.0.1:${port}`;
}

export type BffFetchInit = RequestInit & {
  searchParams?: Record<string, string | number | undefined>;
};

export async function bffFetch<T>(
  path: string,
  init?: BffFetchInit,
): Promise<T> {
  const isBrowser = typeof window !== "undefined";
  const url = new URL(
    `/api/bff${path}`,
    isBrowser ? window.location.origin : bffBase(),
  );
  if (init?.searchParams) {
    for (const [k, v] of Object.entries(init.searchParams)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  const target = isBrowser ? `${url.pathname}${url.search}` : url.toString();
  const res = await fetch(target, init);
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
