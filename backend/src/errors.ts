/**
 * BffError hierarchy. Framework-agnostic — the Hono error-handler middleware
 * (src/middlewares/error-handler.ts) maps these to a uniform JSON envelope
 * matching `BffErrorBody` from `@Types/error`.
 */

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
    upstream: "contentful" | "sap-commerce" | "algolia" | "bloomreach",
    status: number,
    message: string,
    cause?: unknown,
  ) {
    super(
      `[${upstream}] ${message}`,
      status,
      "UPSTREAM_ERROR",
      undefined,
      cause,
    );
    this.name = "UpstreamError";
  }
}
