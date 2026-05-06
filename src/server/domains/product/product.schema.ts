import { z } from "zod";

const optionalIntFromQuery = z.preprocess(
  (v) => (v === "" || v === undefined ? undefined : Number(v)),
  z.number().int().nonnegative().optional(),
);

export const productGetParamsSchema = z.object({
  code: z.string().min(1, "code is required"),
});

export const productSearchQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  page: optionalIntFromQuery,
  pageSize: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number().int().min(1).max(100).optional(),
  ),
  sort: z.string().optional(),
});

export type ProductGetParams = z.infer<typeof productGetParamsSchema>;
export type ProductSearchQuery = z.infer<typeof productSearchQuerySchema>;
