import "server-only";
import { getContentfulClient } from "@/server/adapters/contentful/contentful.client";
import { cacheTags } from "@/server/cache/tags";
import { getEnv } from "@/server/config/env";
import { NotFoundError, UpstreamError } from "@/server/errors";
import { toHeader } from "@/server/domains/header/header.mapper";
import { logger } from "@/server/observability/logger";
import type { Header } from "@/contracts/header";

export async function getHeader(): Promise<Header> {
  const env = getEnv();
  const client = getContentfulClient();
  const entryId = env.CONTENTFUL_HEADER_ENTRY_ID;

  try {
    // Use getEntries (collection endpoint) instead of getEntry — only the
    // collection endpoint resolves linked entries via `include`. The single
    // /entries/{id} endpoint returns Link placeholders without `includes`.
    const res = await client.withoutUnresolvableLinks.getEntries({
      "sys.id": entryId,
      limit: 1,
      include: 3,
    });
    const entry = res.items[0];
    if (!entry) {
      throw new NotFoundError(`Header entry "${entryId}" not found`);
    }
    void cacheTags.header();

    const mapped = toHeader(entry);

    if (process.env.NODE_ENV !== "production") {
      console.log("[header.service] raw entry fields:");
      console.dir(entry.fields, { depth: 6, colors: true });
      console.log("[header.service] mapped Header contract:");
      console.dir(mapped, { depth: 6, colors: true });
    } else {
      logger.info(
        {
          entryId,
          mainNavCount: mapped.mainNav.length,
          utilityLinksCount: mapped.utilityLinks.length,
          localesCount: mapped.locales.length,
          hasAllProductsNav: !!mapped.allProductsNav,
          hasLogo: !!mapped.logo.url,
        },
        "header.fetched",
      );
    }

    return mapped;
  } catch (err) {
    if (err instanceof NotFoundError) throw err;
    throw new UpstreamError(
      "contentful",
      502,
      `Failed to fetch header entry "${entryId}"`,
      err,
    );
  }
}
