import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { BffErrorBody } from "@/contracts/error";
import { logger } from "@/server/observability/logger";

export class BffError extends Error {
  constructor(
    message: string,
    readonly status: number = 500,
    readonly code: string = "BFF_ERROR",
    readonly details?: unknown,
    cause?: unknown,
  ) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "BffError";
  }
}

export class ValidationError extends BffError {
  constructor(message: string, details?: unknown) {
    super(message, 400, "INVALID_REQUEST", details);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends BffError {
  constructor(message: string) {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class UpstreamError extends BffError {
  constructor(
    upstream: "contentful" | "sap-commerce",
    status: number,
    message: string,
    cause?: unknown,
  ) {
    super(`[${upstream}] ${message}`, status, "UPSTREAM_ERROR", undefined, cause);
    this.name = "UpstreamError";
  }
}

type ErrorResponseOptions = {
  requestId?: string;
};

export function bffErrorResponse(
  err: unknown,
  opts: ErrorResponseOptions = {},
): NextResponse<BffErrorBody> {
  if (err instanceof ZodError) {
    return bffErrorResponse(
      new ValidationError("Invalid request", err.issues),
      opts,
    );
  }

  if (err instanceof BffError) {
    if (err.status >= 500) {
      logger.error({ err, requestId: opts.requestId }, "BFF error");
    }
    return NextResponse.json<BffErrorBody>(
      {
        error: {
          code: err.code,
          message: err.message,
          requestId: opts.requestId,
          details: err.details,
        },
      },
      { status: err.status },
    );
  }

  logger.error({ err, requestId: opts.requestId }, "Unhandled BFF error");
  return NextResponse.json<BffErrorBody>(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
        requestId: opts.requestId,
      },
    },
    { status: 500 },
  );
}
