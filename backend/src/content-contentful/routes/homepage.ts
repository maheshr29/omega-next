import { Hono } from "hono";
import { withBff } from "@/http/with-bff";
import { getHomePage } from "@Content-contentful/apis/homePage";

export const homepageRoutes = new Hono();

homepageRoutes.get(
  "/homepage",
  withBff({}, () => getHomePage()),
);
