import "server-only";
import { getContentfulClient } from "@/server/adapters/contentful/contentful.client";
import { cacheTags } from "@/server/cache/tags";
import { getEnv } from "@/server/config/env";
import { NotFoundError, UpstreamError } from "@/server/errors";
import { toHomePage } from "@/server/domains/homePage/homePage.mapper";
import { logger } from "@/server/observability/logger";
import type { HomePage } from "@/contracts/homePage";

export async function getHomePage(): Promise<HomePage> {
  const env = getEnv();
  const client = getContentfulClient();
  const entryId = env.CONTENTFUL_HOME_PAGE_ENTRY_ID;

  try {
    // include=10 is the Delivery API max; the page composes header → hero →
    // featured → help → industry → footer, and the deepest of those (footer
    // columns → quickLinks → ...) goes 4 levels deep. 10 covers it with room.
    const res = await client.withoutUnresolvableLinks.getEntries({
      "sys.id": entryId,
      limit: 1,
      include: 10,
    });
    const entry = res.items[0];
    if (!entry) {
      throw new NotFoundError(`Home page entry "${entryId}" not found`);
    }
    void cacheTags.homePage();

    const mapped = toHomePage(entry);

    logger.info(
      {
        entryId,
        sectionCount: mapped.sections.length,
        sectionTypes: mapped.sections.map((s) => s.type),
      },
      "homePage.fetched",
    );

    return mapped;
  } catch (err) {
    if (err instanceof NotFoundError) throw err;
    throw new UpstreamError(
      "contentful",
      502,
      `Failed to fetch home page entry "${entryId}"`,
      err,
    );
  }
}
