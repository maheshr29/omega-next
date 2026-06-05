import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ZodError } from "zod";
import type { BffErrorBody } from "@Types/error";
import { BffError, ValidationError } from "@/errors";
import { logger } from "@/observability/logger";

export function onError(err: Error, c: Context): Response {
  const requestId = c.get("requestId");

  // Zod validation errors → ValidationError envelope.
  if (err instanceof ZodError) {
    const ve = new ValidationError("Invalid request", err.issues);
    const body: BffErrorBody = {
      error: {
        code: ve.code,
        message: ve.message,
        requestId,
        details: ve.details,
      },
    };
    return c.json(body, ve.status as ContentfulStatusCode);
  }

  if (err instanceof BffError) {
    if (err.status >= 500) {
      logger.error({ err, requestId }, "BFF error");
    }
    const body: BffErrorBody = {
      error: {
        code: err.code,
        message: err.message,
        requestId,
        details: err.details,
      },
    };
    return c.json(body, err.status as ContentfulStatusCode);
  }

  logger.error({ err, requestId }, "Unhandled BFF error");
  const body: BffErrorBody = {
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
      requestId,
    },
  };
  return c.json(body, 500);
}
