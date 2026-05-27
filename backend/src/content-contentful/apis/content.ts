import { getContentfulClient } from "@Content-contentful/utils/contentful-client";
import { cacheTags } from "@/cache/tags";
import { NotFoundError, UpstreamError } from "@/errors";
import { toPageContent } from "@Content-contentful/mappers/content";
import type { PageContent } from "@Types/content";

export async function getPageBySlug(slug: string): Promise<PageContent> {
  const client = getContentfulClient();
  try {
    const res = await client.withoutUnresolvableLinks.getEntries({
      content_type: "page",
      "fields.slug": slug,
      limit: 1,
      include: 3,
    });
    const entry = res.items[0];
    if (!entry) {
      throw new NotFoundError(`Page "${slug}" not found`);
    }
    // Cache tags are applied via fetch() inside the SDK on Next.js's fetch
    // override â€” we intentionally tag at the service edge using the exported
    // tag vocabulary so revalidation is consistent across services.
    void cacheTags.contentPage(slug);
    return toPageContent(entry);
  } catch (err) {
    if (err instanceof NotFoundError) throw err;
    throw new UpstreamError(
      "contentful",
      502,
      `Failed to fetch page "${slug}"`,
      err,
    );
  }
}
