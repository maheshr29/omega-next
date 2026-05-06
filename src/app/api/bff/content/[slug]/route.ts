import { withBff } from "@/server/http/handler";
import { pageBySlugParamsSchema } from "@/server/domains/content/content.schema";
import { getPageBySlug } from "@/server/domains/content/content.service";

export const runtime = "nodejs";

export const GET = withBff(
  { params: pageBySlugParamsSchema },
  ({ params }) => getPageBySlug(params.slug),
);
