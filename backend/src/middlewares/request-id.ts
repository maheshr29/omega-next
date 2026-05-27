import type { MiddlewareHandler } from "hono";

export const REQUEST_ID_HEADER = "x-request-id";

declare module "hono" {
  interface ContextVariableMap {
    requestId: string;
  }
}

export const requestId: MiddlewareHandler = async (c, next) => {
  const incoming = c.req.header(REQUEST_ID_HEADER);
  const id = incoming ?? crypto.randomUUID();
  c.set("requestId", id);
  await next();
  c.res.headers.set(REQUEST_ID_HEADER, id);
};
