import type { PageContent } from "@shared/types/content";
import { bffFetch } from "./http";

export const contentApi = {
  getPage: (slug: string) =>
    bffFetch<PageContent>(`/content/${encodeURIComponent(slug)}`),
} as const;
