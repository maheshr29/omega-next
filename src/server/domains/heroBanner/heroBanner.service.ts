import "server-only";
import { getContentfulClient } from "@/server/adapters/contentful/contentful.client";
import { cacheTags } from "@/server/cache/tags";
import { getEnv } from "@/server/config/env";
import { NotFoundError, UpstreamError } from "@/server/errors";
import { toHeroBanner } from "@/server/domains/heroBanner/heroBanner.mapper";
import { logger } from "@/server/observability/logger";
import type { HeroBanner } from "@/contracts/heroBanner";

export async function getHeroBanner(): Promise<HeroBanner> {
  const env = getEnv();
  const client = getContentfulClient();
  const entryId = env.CONTENTFUL_HERO_BANNER_ENTRY_ID;

  try {
    const res = await client.withoutUnresolvableLinks.getEntries({
      "sys.id": entryId,
      limit: 1,
      include: 2,
    });
    const entry = res.items[0];
    if (!entry) {
      throw new NotFoundError(`Hero banner entry "${entryId}" not found`);
    }
    void cacheTags.heroBanner();

    const mapped = toHeroBanner(entry);

    logger.info(
      {
        entryId,
        hasHeadline: !!mapped.headline,
        hasPartnerLogo: !!mapped.partnerLogo,
        hasProductImage: !!mapped.productImage,
        hasReadMore: !!mapped.readMore,
      },
      "heroBanner.fetched",
    );

    return mapped;
  } catch (err) {
    if (err instanceof NotFoundError) throw err;
    throw new UpstreamError(
      "contentful",
      502,
      `Failed to fetch hero banner entry "${entryId}"`,
      err,
    );
  }
}
