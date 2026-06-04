import { randomUUID } from "node:crypto";
import { getEnv } from "@/config/env";
import { bloomreachFetch } from "@Search-bloomreach/utils/bloomreach-client";
import type { BloomreachSuggestResponse } from "@Search-bloomreach/interfaces/bloomreach.types";
import type { SuggestQuery } from "@Search-bloomreach/schemas/suggest";

export async function getSuggestions(
  input: SuggestQuery,
): Promise<BloomreachSuggestResponse> {
  const env = getEnv();
  const domain = env.BLOOMREACH_DEFAULT_DOMAIN ?? "";

  return bloomreachFetch<BloomreachSuggestResponse>(
    env.BLOOMREACH_SUGGEST_URL,
    {
      account_id: env.BLOOMREACH_ACCOUNT_ID,
      auth_key: env.BLOOMREACH_AUTH_KEY,
      request_type: "suggest",
      catalog_views: env.BLOOMREACH_CATALOG_VIEWS,
      request_id: input.request_id ?? randomUUID().replace(/-/g, "").slice(0, 16),
      sku_rows: input.sku_rows ?? 1,
      q: input.q,
      url: input.url ?? (domain ? `${domain}/en-us/search/autocomplete/SearchBox` : undefined),
      ref_url: input.ref_url ?? (domain ? `${domain}/en-us/` : undefined),
      _br_uid_2: input._br_uid_2,
    },
  );
}
