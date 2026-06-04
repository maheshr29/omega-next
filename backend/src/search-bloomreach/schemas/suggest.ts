import { z } from "zod";

const optionalIntFromQuery = z.preprocess(
  (v) => (v === "" || v === undefined ? undefined : Number(v)),
  z.number().int().min(0).max(50).optional(),
);

export const suggestQuerySchema = z.object({
  q: z.string().min(1, "q is required"),
  sku_rows: optionalIntFromQuery,
  request_id: z.string().optional(),
  url: z.string().optional(),
  ref_url: z.string().optional(),
  _br_uid_2: z.string().optional(),
});

export type SuggestQuery = z.infer<typeof suggestQuerySchema>;
