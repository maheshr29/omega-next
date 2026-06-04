import { UpstreamError } from "@/errors";

const DEFAULT_TIMEOUT_MS = 6_000;

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

export type BloomreachQuery = Record<string, string | number | undefined>;

export type BloomreachFetchOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

export async function bloomreachFetch<T>(
  endpoint: string,
  query: BloomreachQuery,
  opts: BloomreachFetchOptions = {},
): Promise<T> {
  const url = new URL(endpoint);
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== "") {
      url.searchParams.set(k, String(v));
    }
  }

  const { signal, cancel } = withTimeout(
    opts.signal,
    opts.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );

  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal,
    });
  } catch (err) {
    throw new UpstreamError(
      "bloomreach",
      502,
      `${endpoint} → ${(err as Error).message}`,
      err,
    );
  } finally {
    cancel();
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new UpstreamError(
      "bloomreach",
      res.status,
      `${endpoint} → ${res.status} ${text.slice(0, 200)}`,
    );
  }

  return (await res.json()) as T;
}
