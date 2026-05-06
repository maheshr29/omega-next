import { NextResponse, type NextRequest } from "next/server";
import { cacheTags, purgeTag } from "@/server/cache/tags";
import { logger } from "@/server/observability/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * SAP Commerce webhook → revalidate product cache tags.
 * Wire this up to your PIM / catalog publishing event so Next.js drops the
 * cached product data within seconds of a price or stock change.
 *
 * Body shape: { productCodes: string[], event?: "PRICE" | "STOCK" | "PUBLISH" }
 */
export async function POST(req: NextRequest) {
  const expected = process.env.SAP_COMMERCE_WEBHOOK_SECRET;
  if (!expected || req.headers.get("x-webhook-secret") !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
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
  return NextResponse.json({ ok: true, invalidated: codes.length });
}
