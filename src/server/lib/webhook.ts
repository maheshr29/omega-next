import "server-only";
import { timingSafeEqual } from "node:crypto";

const HEADER_NAME = "x-webhook-secret";

/**
 * Constant-time check of an inbound webhook secret against the expected value.
 * Returns `null` when the secret is valid; otherwise an `unauthorized`/`misconfigured`
 * code so the caller can return a 401/500 without leaking which side failed.
 */
export function verifyWebhookSecret(
  headers: Headers,
  expected: string | undefined,
): null | "unauthorized" | "misconfigured" {
  if (!expected) return "misconfigured";
  const provided = headers.get(HEADER_NAME);
  if (!provided) return "unauthorized";

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return "unauthorized";
  return timingSafeEqual(a, b) ? null : "unauthorized";
}
