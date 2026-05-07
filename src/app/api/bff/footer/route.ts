import { withBff } from "@/server/http/handler";
import { getFooter } from "@/server/domains/footer/footer.service";

export const runtime = "nodejs";

export const GET = withBff({}, () => getFooter());
