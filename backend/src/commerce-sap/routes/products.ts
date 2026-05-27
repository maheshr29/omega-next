import { Hono } from "hono";
import { withBff } from "@/http/with-bff";
import { getProductByCode, searchProducts } from "@Commerce-sap/apis/product";
import {
  productGetParamsSchema,
  productSearchQuerySchema,
} from "@Commerce-sap/schemas/product";

export const productsRoutes = new Hono();

productsRoutes.get(
  "/products",
  withBff({ query: productSearchQuerySchema }, ({ query }) =>
    searchProducts(query),
  ),
);

productsRoutes.get(
  "/products/:code",
  withBff({ params: productGetParamsSchema }, ({ params }) =>
    getProductByCode(params.code),
  ),
);
