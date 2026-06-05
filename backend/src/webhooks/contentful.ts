import { Hono } from "hono";
import { cacheTags, purgeTag } from "@/cache/tags";
import { getEnv } from "@/config/env";
import { verifyWebhookSecret } from "@/lib/webhook";
import { logger } from "@/observability/logger";

export const contentfulWebhook = new Hono();

contentfulWebhook.post("/contentful", async (c) => {
  const result = verifyWebhookSecret(
    new Headers(c.req.raw.headers),
    getEnv().CONTENTFUL_WEBHOOK_SECRET,
  );
  if (result === "misconfigured") {
    logger.error({}, "contentful.webhook.secret-missing");
    return c.json({ error: "misconfigured" }, 500);
  }
  if (result === "unauthorized") {
    return c.json({ error: "unauthorized" }, 401);
  }

  const body = (await c.req.json().catch(() => null)) as {
    sys?: { contentType?: { sys?: { id?: string } } };
    fields?: { slug?: { [locale: string]: string } };
  } | null;

  const contentTypeId = body?.sys?.contentType?.sys?.id;
  const slugField = body?.fields?.slug;
  const slug = slugField ? Object.values(slugField)[0] : undefined;

  // The homePage entry composes header, heroBanner, featuredProductsSection,
  // helpSection, industrySection, and footer (plus their nested card/link
  // entries). A publish on any of those should invalidate the page tag.
  const HOME_PAGE_CONTENT_TYPES = new Set([
    "homePage",
    "header",
    "heroBanner",
    "featuredProductsSection",
    "helpSection",
    "industrySection",
    "footer",
    "navItem",
    "helpCard",
    "industryCard",
    "footerColumn",
    "footerBottom",
    "quickLinks",
    "connectWithUs",
    "socialLink",
    "locale",
  ]);

  if (contentTypeId === "page" && slug) {
    purgeTag(cacheTags.contentPage(slug));
    logger.info({ slug }, "contentful.webhook.page-invalidated");
  } else if (contentTypeId && HOME_PAGE_CONTENT_TYPES.has(contentTypeId)) {
    purgeTag(cacheTags.homePage());
    logger.info(
      { contentTypeId },
      "contentful.webhook.home-page-invalidated",
    );
  } else {
    purgeTag(cacheTags.contentAll());
    logger.info({ contentTypeId }, "contentful.webhook.bulk-invalidated");
  }

  return c.json({ ok: true });
});
