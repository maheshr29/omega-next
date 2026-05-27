import "dotenv/config";
import { serve } from "@hono/node-server";
import { app } from "@/app";
import { getEnv } from "@/config/env";
import { logger } from "@/observability/logger";

const env = getEnv();

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  ({ port }) => {
    logger.info({ port }, "backend listening");
  },
);
