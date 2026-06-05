import { z } from "zod";

/**
 * Backend env schema. All upstream vendor credentials live here.
 * Algolia fields are added in phase 5.
 */
const envSchema = z.object({
  // --- server ---
  PORT: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 4000)),
  LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error"])
    .optional()
    .default("info"),
  ALLOWED_ORIGINS: z
    .string()
    .optional()
    .default("*")
    .transform((v) =>
      v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ),

  // --- Contentful ---
  CONTENTFUL_SPACE_ID: z.string().min(1),
  CONTENTFUL_ENVIRONMENT: z.string().min(1).default("master"),
  CONTENTFUL_DELIVERY_TOKEN: z.string().min(1),
  CONTENTFUL_PREVIEW_TOKEN: z.string().optional(),
  CONTENTFUL_USE_PREVIEW: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  CONTENTFUL_HOME_PAGE_ENTRY_ID: z.string().min(1),

  // --- SAP Commerce (OCC) ---
  SAP_COMMERCE_BASE_URL: z.url(),
  SAP_COMMERCE_BASE_SITE_ID: z.string().min(1),
  SAP_COMMERCE_TOKEN_URL: z.url(),
  SAP_COMMERCE_CLIENT_ID: z.string().min(1),
  SAP_COMMERCE_CLIENT_SECRET: z.string().min(1),

  // --- Bloomreach (search + suggest) ---
  BLOOMREACH_SUGGEST_URL: z.url(),
  BLOOMREACH_ACCOUNT_ID: z.string().min(1),
  BLOOMREACH_AUTH_KEY: z.string().min(1),
  BLOOMREACH_CATALOG_VIEWS: z.string().min(1),
  BLOOMREACH_DEFAULT_DOMAIN: z.string().optional(),
  BLOOMREACH_CORE_URL: z
    .url()
    .optional()
    .default("http://staging-core.dxpapi.com/api/v1/core/"),
  BLOOMREACH_CATEGORY_CATALOG: z
    .string()
    .optional()
    .default("category_en_dwyer"),
  BLOOMREACH_CATEGORY_FL: z
    .string()
    .optional()
    .default("item_id,name,url,image,parentCategory,description,order"),

  // --- BFF cache TTLs ---
  BFF_PRODUCT_REVALIDATE_SECONDS: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 60)),
  BFF_CONTENT_REVALIDATE_SECONDS: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 300)),

  // --- Webhook secrets ---
  CONTENTFUL_WEBHOOK_SECRET: z.string().optional(),
  SAP_COMMERCE_WEBHOOK_SECRET: z.string().optional(),
});

export type BackendEnv = z.infer<typeof envSchema>;

let cached: BackendEnv | null = null;

export function getEnv(): BackendEnv {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration — ${issues}`);
  }
  cached = parsed.data;
  return cached;
}
