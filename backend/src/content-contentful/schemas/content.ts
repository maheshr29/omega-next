import { z } from "zod";

export const pageBySlugParamsSchema = z.object({
  slug: z.string().min(1, "slug is required"),
});

export type PageBySlugParams = z.infer<typeof pageBySlugParamsSchema>;
