import { Hono } from "hono";
import { cors } from "hono/cors";
import { getEnv } from "@/config/env";
import { requestId } from "@/middlewares/request-id";
import { requestLogger } from "@/middlewares/request-logger";
import { onError } from "@/middlewares/error-handler";
import { bffCacheControl } from "@/middlewares/cache-control";
import { productsRoutes } from "@Commerce-sap/routes/products";
import { contentRoutes } from "@Content-contentful/routes/content";
import { homepageRoutes } from "@Content-contentful/routes/homepage";
import { contentfulWebhook } from "@/webhooks/contentful";
import { sapCommerceWebhook } from "@/webhooks/sap-commerce";

export const app = new Hono();

const env = getEnv();

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (env.ALLOWED_ORIGINS.includes("*")) return origin ?? "*";
      return origin && env.ALLOWED_ORIGINS.includes(origin) ? origin : null;
    },
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["content-type", "x-request-id", "x-webhook-secret"],
    exposeHeaders: ["x-request-id"],
  }),
);
app.use("*", requestId);
app.use("*", requestLogger);

app.onError(onError);

// Health.
app.get("/health", (c) =>
  c.json({ ok: true, requestId: c.get("requestId") }),
);

// BFF routes (mounted under /bff). Cache-Control for edge caching.
app.use("/bff/*", bffCacheControl);
app.route("/bff", productsRoutes);
app.route("/bff", contentRoutes);
app.route("/bff", homepageRoutes);

// Upstream webhook receivers (mounted under /webhooks).
app.route("/webhooks", contentfulWebhook);
app.route("/webhooks", sapCommerceWebhook);
