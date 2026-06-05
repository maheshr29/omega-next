import { Hono } from "hono";
import { withBff } from "@/http/with-bff";
import { getCategoryContent } from "@Search-bloomreach/apis/category-content";
import { categoryContentQuerySchema } from "@Search-bloomreach/schemas/category-content";

export const categoryContentRoutes = new Hono();

categoryContentRoutes.get(
  "/category/content",
  withBff({ query: categoryContentQuerySchema }, ({ query }) =>
    getCategoryContent(query),
  ),
);
