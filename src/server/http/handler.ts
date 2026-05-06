import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import type { ZodType } from "zod";
import { bffErrorResponse } from "@/server/errors";
import { logger, type Logger } from "@/server/observability/logger";

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
  req: NextRequest;
  requestId: string;
  log: Logger;
};

export type BffHandler<S extends BffSchemas, TOutput> = (
  input: BffInput<S>,
  ctx: BffContext,
) => Promise<TOutput>;

type RouteContext = { params?: Promise<unknown> };

export function withBff<S extends BffSchemas, TOutput>(
  schemas: S,
  handler: BffHandler<S, TOutput>,
) {
  return async (req: NextRequest, ctx: RouteContext) => {
    const requestId =
      req.headers.get("x-request-id") ?? crypto.randomUUID();
    const log = logger.child({
      requestId,
      method: req.method,
      route: req.nextUrl.pathname,
    });
    const start = Date.now();

    try {
      const rawParams = ctx.params ? await ctx.params : {};
      const params = (schemas.params
        ? schemas.params.parse(rawParams)
        : undefined) as Inferred<S["params"]>;

      const query = (schemas.query
        ? schemas.query.parse(
            Object.fromEntries(req.nextUrl.searchParams.entries()),
          )
        : undefined) as Inferred<S["query"]>;

      let body: Inferred<S["body"]> = undefined as Inferred<S["body"]>;
      if (schemas.body) {
        const parsed = req.method === "GET" || req.method === "HEAD"
          ? undefined
          : await req.json().catch(() => undefined);
        body = schemas.body.parse(parsed) as Inferred<S["body"]>;
      }

      const result = await handler({ params, query, body }, { req, requestId, log });

      log.info(
        { durationMs: Date.now() - start, status: 200 },
        "bff.ok",
      );

      const res = NextResponse.json(result);
      res.headers.set("x-request-id", requestId);
      return res;
    } catch (err) {
      const response = bffErrorResponse(err, { requestId });
      response.headers.set("x-request-id", requestId);
      log.warn(
        { durationMs: Date.now() - start, status: response.status },
        "bff.error",
      );
      return response;
    }
  };
}
