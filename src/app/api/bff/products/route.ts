import { withBff } from "@/server/http/handler";
import { productSearchQuerySchema } from "@/server/domains/product/product.schema";
import { searchProducts } from "@/server/domains/product/product.service";

export const runtime = "nodejs";

export const GET = withBff(
  { query: productSearchQuerySchema },
  ({ query }) => searchProducts(query),
);
