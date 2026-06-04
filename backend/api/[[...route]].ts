/**
 * Vercel entry — catch-all that hands every path to the Hono `app`.
 *
 * `backend/src/server.ts` is for local dev (Node listener on :4000); Vercel
 * ignores it and uses this file. Same Hono `app`, same routes.
 */
import "dotenv/config";
import { handle } from "hono/vercel";
import { app } from "../src/app";

export const config = {
  runtime: "nodejs",
};


export default handle(app);
