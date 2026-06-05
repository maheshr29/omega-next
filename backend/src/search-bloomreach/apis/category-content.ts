import { getEnv } from "@/config/env";
import { bloomreachFetch } from "@Search-bloomreach/utils/bloomreach-client";
import type { BloomreachCategoryContentResponse } from "@Search-bloomreach/interfaces/bloomreach.types";
import type { CategoryContentQuery } from "@Search-bloomreach/schemas/category-content";

export async function getCategoryContent(
  input: CategoryContentQuery,
): Promise<BloomreachCategoryContentResponse> {
  const env = getEnv();
  const domain = env.BLOOMREACH_DEFAULT_DOMAIN ?? "";

  return bloomreachFetch<BloomreachCategoryContentResponse>(
    env.BLOOMREACH_CORE_URL,
    {
      account_id: env.BLOOMREACH_ACCOUNT_ID,
      request_type: "search",
      search_type: "keyword",
      catalog_name: env.BLOOMREACH_CATEGORY_CATALOG,
      fl: env.BLOOMREACH_CATEGORY_FL,
      url: domain || "1",
      q: input.q,
      start: input.start ?? 0,
      rows: input.rows ?? 10,
      sort: input.sort ?? "order asc",
    },
  );
}
