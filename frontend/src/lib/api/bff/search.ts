import type { SuggestParams, SuggestResponse } from "@shared/types/search";
import { bffFetch } from "./http";

export const searchApi = {
  suggest: (params: SuggestParams, init?: { signal?: AbortSignal }) =>
    bffFetch<SuggestResponse>("/search/suggest", {
      searchParams: params,
      signal: init?.signal,
    }),
} as const;
