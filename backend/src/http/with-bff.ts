import type { Context, Handler } from "hono";
import type { ZodType } from "zod";
import { logger, type Logger } from "@/observability/logger";

export type BffSchemas<TParams = unknown, TQuery = unknown, TBody = unknown> = {
  params?: ZodType<TParams>;
  query?: ZodType<TQuery>;
  body?: ZodType<TBody>;
};

type Inferred<T> = T extends ZodType<infer U> ? U : undefined;

export type BffInput<S extends BffSchemas> = {
  params: Inferred<S["params"]>;
  query: Inferred<S["query"]>;
  body: Inferred<S["body"]>;
};

export type BffContext = {
  c: Context;
  requestId: string;
  log: Logger;
};

export type BffHandler<S extends BffSchemas, TOutput> = (
  input: BffInput<S>,
  ctx: BffContext,
) => Promise<TOutput>;

/**
 * Wraps a domain handler with Zod validation + structured logging.
 * Errors thrown inside the handler propagate to Hono's `app.onError(onError)`
 * registered in app.ts, which maps `BffError`/`ZodError` to the uniform
 * `BffErrorBody` envelope.
 */
export function withBff<S extends BffSchemas, TOutput>(
  schemas: S,
  handler: BffHandler<S, TOutput>,
): Handler {
  return async (c) => {
    const requestId = c.get("requestId");
    const log = logger.child({
      requestId,
      method: c.req.method,
      route: c.req.routePath,
    });
    const start = Date.now();

    const rawParams = c.req.param() as Record<string, string>;
    const params = (
      schemas.params ? schemas.params.parse(rawParams) : undefined
    ) as Inferred<S["params"]>;

    const query = (
      schemas.query ? schemas.query.parse(c.req.query()) : undefined
    ) as Inferred<S["query"]>;

    let body: Inferred<S["body"]> = undefined as Inferred<S["body"]>;
    if (schemas.body) {
      const parsed =
        c.req.method === "GET" || c.req.method === "HEAD"
          ? undefined
          : await c.req.json().catch(() => undefined);
      body = schemas.body.parse(parsed) as Inferred<S["body"]>;
    }

    const result = await handler({ params, query, body }, { c, requestId, log });

    log.info({ durationMs: Date.now() - start, status: 200 }, "bff.ok");
    return c.json(result as object);
  };
}
