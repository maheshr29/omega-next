import { NextResponse, type NextRequest } from "next/server";
import { cacheTags, purgeTag } from "@/server/cache/tags";
import { logger } from "@/server/observability/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Contentful webhook → revalidate cache tags.
 * Configure in Contentful: target this URL on Publish/Unpublish of any entry,
 * and set the `x-webhook-secret` custom header to CONTENTFUL_WEBHOOK_SECRET.
 */
export async function POST(req: NextRequest) {
  const expected = process.env.CONTENTFUL_WEBHOOK_SECRET;
  if (!expected || req.headers.get("x-webhook-secret") !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    sys?: { contentType?: { sys?: { id?: string } } };
    fields?: { slug?: { [locale: string]: string } };
  } | null;

  const contentTypeId = body?.sys?.contentType?.sys?.id;
  const slugField = body?.fields?.slug;
  const slug = slugField ? Object.values(slugField)[0] : undefined;

  if (contentTypeId === "page" && slug) {
    purgeTag(cacheTags.contentPage(slug));
    logger.info({ slug }, "contentful.webhook.page-invalidated");
  } else if (contentTypeId === "header") {
    purgeTag(cacheTags.header());
    logger.info({ contentTypeId }, "contentful.webhook.header-invalidated");
  } else if (contentTypeId === "footer") {
    purgeTag(cacheTags.footer());
    logger.info({ contentTypeId }, "contentful.webhook.footer-invalidated");
  } else {
    purgeTag(cacheTags.contentAll());
    logger.info({ contentTypeId }, "contentful.webhook.bulk-invalidated");
  }

  return NextResponse.json({ ok: true });
}
