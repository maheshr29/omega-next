import { withBff } from "@/server/http/handler";
import { productGetParamsSchema } from "@/server/domains/product/product.schema";
import { getProductByCode } from "@/server/domains/product/product.service";

export const runtime = "nodejs";

export const GET = withBff(
  { params: productGetParamsSchema },
  ({ params }) => getProductByCode(params.code),
);
