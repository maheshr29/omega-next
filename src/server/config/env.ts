import "server-only";
import { z } from "zod";

const envSchema = z.object({
  CONTENTFUL_SPACE_ID: z.string().min(1),
  CONTENTFUL_ENVIRONMENT: z.string().min(1).default("master"),
  CONTENTFUL_DELIVERY_TOKEN: z.string().min(1),
  CONTENTFUL_PREVIEW_TOKEN: z.string().optional(),
  CONTENTFUL_USE_PREVIEW: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  CONTENTFUL_HEADER_ENTRY_ID: z
    .string()
    .min(1)
    .default("4VHSB9TSwNw9lylmyfoynm"),
  CONTENTFUL_FOOTER_ENTRY_ID: z
    .string()
    .min(1)
    .default("3eST4tydgikBcCV0iCWmo"),
  CONTENTFUL_HERO_BANNER_ENTRY_ID: z
    .string()
    .min(1)
    .default("4O4rvOry7Hz1AbceWaagZE"),
  CONTENTFUL_HELP_SECTION_ENTRY_ID: z
    .string()
    .min(1)
    .default("7vV361Mnb543FSepENtTKj"),
  CONTENTFUL_INDUSTRY_SECTION_ENTRY_ID: z
    .string()
    .min(1)
    .default("32scu7Yc2lF4YqnxQhDVmW"),

  SAP_COMMERCE_BASE_URL: z.string().url(),
  SAP_COMMERCE_BASE_SITE_ID: z.string().min(1),
  SAP_COMMERCE_TOKEN_URL: z.string().url(),
  SAP_COMMERCE_CLIENT_ID: z.string().min(1),
  SAP_COMMERCE_CLIENT_SECRET: z.string().min(1),

  BFF_PRODUCT_REVALIDATE_SECONDS: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 60)),
  BFF_CONTENT_REVALIDATE_SECONDS: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 300)),
});

let cached: z.infer<typeof envSchema> | null = null;

export function getEnv() {
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
