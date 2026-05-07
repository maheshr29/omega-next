import { withBff } from "@/server/http/handler";
import { getHeader } from "@/server/domains/header/header.service";

export const runtime = "nodejs";

export const GET = withBff({}, () => getHeader());
