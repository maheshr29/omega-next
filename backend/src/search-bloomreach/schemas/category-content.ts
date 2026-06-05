import { z } from "zod";

const optionalIntFromQuery = (max: number) =>
  z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number().int().min(0).max(max).optional(),
  );

export const categoryContentQuerySchema = z.object({
  q: z.string().min(1, "q is required"),
  start: optionalIntFromQuery(10_000),
  rows: optionalIntFromQuery(200),
  sort: z.string().optional(),
});

export type CategoryContentQuery = z.infer<typeof categoryContentQuerySchema>;
