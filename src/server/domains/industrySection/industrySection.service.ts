import "server-only";
import { getContentfulClient } from "@/server/adapters/contentful/contentful.client";
import { cacheTags } from "@/server/cache/tags";
import { getEnv } from "@/server/config/env";
import { NotFoundError, UpstreamError } from "@/server/errors";
import { toIndustrySection } from "@/server/domains/industrySection/industrySection.mapper";
import { logger } from "@/server/observability/logger";
import type { IndustrySection } from "@/contracts/industrySection";

export async function getIndustrySection(): Promise<IndustrySection> {
  const env = getEnv();
  const client = getContentfulClient();
  const entryId = env.CONTENTFUL_INDUSTRY_SECTION_ENTRY_ID;

  try {
    const res = await client.withoutUnresolvableLinks.getEntries({
      "sys.id": entryId,
      limit: 1,
      include: 3,
    });
    const entry = res.items[0];
    if (!entry) {
      throw new NotFoundError(`Industry section entry "${entryId}" not found`);
    }
    void cacheTags.industrySection();

    const mapped = toIndustrySection(entry);

    if (process.env.NODE_ENV !== "production") {
      console.log("[industrySection.service] raw entry fields:");
      console.dir(entry.fields, { depth: 6, colors: true });
      console.log("[industrySection.service] mapped IndustrySection contract:");
      console.dir(mapped, { depth: 6, colors: true });
    } else {
      logger.info(
        {
          entryId,
          title: mapped.title,
          cardsCount: mapped.cards.length,
        },
        "industrySection.fetched",
      );
    }

    return mapped;
  } catch (err) {
    if (err instanceof NotFoundError) throw err;
    throw new UpstreamError(
      "contentful",
      502,
      `Failed to fetch industry section entry "${entryId}"`,
      err,
    );
  }
}
