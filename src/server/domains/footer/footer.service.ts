import "server-only";
import { getContentfulClient } from "@/server/adapters/contentful/contentful.client";
import { cacheTags } from "@/server/cache/tags";
import { getEnv } from "@/server/config/env";
import { NotFoundError, UpstreamError } from "@/server/errors";
import { toFooter } from "@/server/domains/footer/footer.mapper";
import { logger } from "@/server/observability/logger";
import type { Footer } from "@/contracts/footer";

export async function getFooter(): Promise<Footer> {
  const env = getEnv();
  const client = getContentfulClient();
  const entryId = env.CONTENTFUL_FOOTER_ENTRY_ID;

  try {
    const res = await client.withoutUnresolvableLinks.getEntries({
      "sys.id": entryId,
      limit: 1,
      include: 4,
    });
    const entry = res.items[0];
    if (!entry) {
      throw new NotFoundError(`Footer entry "${entryId}" not found`);
    }
    void cacheTags.footer();

    const mapped = toFooter(entry);

    logger.info(
      {
        entryId,
        columnsCount: mapped.columns.length,
        quickLinksCount: mapped.quickLinks?.links.length ?? 0,
        socialLinksCount: mapped.connect?.socialLinks.length ?? 0,
        legalLinksCount: mapped.bottom?.legalLinks.length ?? 0,
      },
      "footer.fetched",
    );

    return mapped;
  } catch (err) {
    if (err instanceof NotFoundError) throw err;
    throw new UpstreamError(
      "contentful",
      502,
      `Failed to fetch footer entry "${entryId}"`,
      err,
    );
  }
}
