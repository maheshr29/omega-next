import { Hono } from "hono";
import { withBff } from "@/http/with-bff";
import { getSuggestions } from "@Search-bloomreach/apis/suggest";
import { suggestQuerySchema } from "@Search-bloomreach/schemas/suggest";

export const suggestRoutes = new Hono();

suggestRoutes.get(
  "/search/suggest",
  withBff({ query: suggestQuerySchema }, ({ query }) => getSuggestions(query)),
);
