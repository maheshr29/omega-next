import { Hono } from "hono";
import { cacheTags, purgeTag } from "@/cache/tags";
import { getEnv } from "@/config/env";
import { verifyWebhookSecret } from "@/lib/webhook";
import { logger } from "@/observability/logger";

export const sapCommerceWebhook = new Hono();

sapCommerceWebhook.post("/sap-commerce", async (c) => {
  const result = verifyWebhookSecret(
    new Headers(c.req.raw.headers),
    getEnv().SAP_COMMERCE_WEBHOOK_SECRET,
  );
  if (result === "misconfigured") {
    logger.error({}, "sap.webhook.secret-missing");
    return c.json({ error: "misconfigured" }, 500);
  }
  if (result === "unauthorized") {
    return c.json({ error: "unauthorized" }, 401);
  }

  const body = (await c.req.json().catch(() => null)) as {
    productCodes?: string[];
    event?: string;
  } | null;

  const codes = body?.productCodes ?? [];
  for (const code of codes) purgeTag(cacheTags.product(code));
  purgeTag(cacheTags.productSearch());

  logger.info(
    { event: body?.event, count: codes.length },
    "sap.webhook.invalidated",
  );
  return c.json({ ok: true, invalidated: codes.length });
});
