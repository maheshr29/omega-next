import "server-only";
import { createClient, type ContentfulClientApi } from "contentful";
import { getEnv } from "@/server/config/env";

let cached: ContentfulClientApi<undefined> | null = null;

export function getContentfulClient(): ContentfulClientApi<undefined> {
  if (cached) return cached;
  const env = getEnv();
  const usePreview = env.CONTENTFUL_USE_PREVIEW;
  const accessToken = usePreview
    ? env.CONTENTFUL_PREVIEW_TOKEN
    : env.CONTENTFUL_DELIVERY_TOKEN;

  if (!accessToken) {
    throw new Error(
      usePreview
        ? "CONTENTFUL_PREVIEW_TOKEN is required when CONTENTFUL_USE_PREVIEW=true"
        : "CONTENTFUL_DELIVERY_TOKEN is required",
    );
  }

  cached = createClient({
    space: env.CONTENTFUL_SPACE_ID,
    environment: env.CONTENTFUL_ENVIRONMENT,
    accessToken,
    host: usePreview ? "preview.contentful.com" : "cdn.contentful.com",
  });
  return cached;
}
