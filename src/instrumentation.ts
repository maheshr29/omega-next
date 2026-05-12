/**
 * Next.js instrumentation hook.
 * Runs once per server process at startup. Use this to wire up
 * OpenTelemetry, Sentry, Datadog, or any other observability provider.
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // e.g. await import("./server/observability/otel");
  }
}

export async function onRequestError(
  err: unknown,
  request: {
    path: string;
    method: string;
    headers: { [key: string]: string };
  },
  context: {
    routerKind: "Pages Router" | "App Router";
    routePath: string;
    routeType: "render" | "route" | "action" | "middleware";
    revalidateReason?: string;
    renderSource?: string;
  },
) {
  const { logger } = await import("@/server/observability/logger");
  logger.error(
    {
      err,
      path: request.path,
      method: request.method,
      routerKind: context.routerKind,
      routeType: context.routeType,
      routePath: context.routePath,
      requestId: request.headers["x-request-id"],
    },
    "request.error",
  );
}
