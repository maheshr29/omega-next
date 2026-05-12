import "server-only";
import { getContentfulClient } from "@/server/adapters/contentful/contentful.client";
import { cacheTags } from "@/server/cache/tags";
import { getEnv } from "@/server/config/env";
import { NotFoundError, UpstreamError } from "@/server/errors";
import { toHelpSection } from "@/server/domains/helpSection/helpSection.mapper";
import { logger } from "@/server/observability/logger";
import type { HelpSection } from "@/contracts/helpSection";

export async function getHelpSection(): Promise<HelpSection> {
  const env = getEnv();
  const client = getContentfulClient();
  const entryId = env.CONTENTFUL_HELP_SECTION_ENTRY_ID;

  try {
    const res = await client.withoutUnresolvableLinks.getEntries({
      "sys.id": entryId,
      limit: 1,
      include: 3,
    });
    const entry = res.items[0];
    if (!entry) {
      throw new NotFoundError(`Help section entry "${entryId}" not found`);
    }
    void cacheTags.helpSection();

    const mapped = toHelpSection(entry);

    if (process.env.NODE_ENV !== "production") {
      console.log("[helpSection.service] raw entry fields:");
      console.dir(entry.fields, { depth: 6, colors: true });
      console.log("[helpSection.service] mapped HelpSection contract:");
      console.dir(mapped, { depth: 6, colors: true });
    } else {
      logger.info(
        {
          entryId,
          title: mapped.title,
          cardsCount: mapped.cards.length,
        },
        "helpSection.fetched",
      );
    }

    return mapped;
  } catch (err) {
    if (err instanceof NotFoundError) throw err;
    throw new UpstreamError(
      "contentful",
      502,
      `Failed to fetch help section entry "${entryId}"`,
      err,
    );
  }
}
