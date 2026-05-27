import { getContentfulClient } from "@Content-contentful/utils/contentful-client";
import { cacheTags } from "@/cache/tags";
import { getEnv } from "@/config/env";
import { NotFoundError, UpstreamError } from "@/errors";
import { toHomePage } from "@Content-contentful/mappers/homePage";
import { logger } from "@/observability/logger";
import type { HomePage } from "@Types/homePage";

export async function getHomePage(): Promise<HomePage> {
  const env = getEnv();
  const client = getContentfulClient();
  const entryId = env.CONTENTFUL_HOME_PAGE_ENTRY_ID;

  try {
    // include=10 is the Delivery API max; the page composes header â†’ hero â†’
    // featured â†’ help â†’ industry â†’ footer, and the deepest of those (footer
    // columns â†’ quickLinks â†’ ...) goes 4 levels deep. 10 covers it with room.
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
