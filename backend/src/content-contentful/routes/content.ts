import { Hono } from "hono";
import { withBff } from "@/http/with-bff";
import { getPageBySlug } from "@Content-contentful/apis/content";
import { pageBySlugParamsSchema } from "@Content-contentful/schemas/content";

export const contentRoutes = new Hono();

contentRoutes.get(
  "/content/:slug",
  withBff({ params: pageBySlugParamsSchema }, ({ params }) =>
    getPageBySlug(params.slug),
  ),
);
