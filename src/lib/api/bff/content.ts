import type { PageContent } from "@/contracts/content";
import { bffFetch } from "./http";

export const contentApi = {
  getPage: (slug: string) =>
    bffFetch<PageContent>(`/content/${encodeURIComponent(slug)}`),
} as const;
