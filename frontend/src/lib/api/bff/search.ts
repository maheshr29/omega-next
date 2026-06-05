import type {
  CategoryContentParams,
  CategoryContentResponse,
  SuggestParams,
  SuggestResponse,
} from "@shared/types/search";
import { bffFetch } from "./http";

export const searchApi = {
  suggest: (params: SuggestParams, init?: { signal?: AbortSignal }) =>
    bffFetch<SuggestResponse>("/search/suggest", {
      searchParams: params,
      signal: init?.signal,
    }),
  categoryContent: (
    params: CategoryContentParams,
    init?: { signal?: AbortSignal },
  ) =>
    bffFetch<CategoryContentResponse>("/category/content", {
      searchParams: params,
      signal: init?.signal,
    }),
} as const;
