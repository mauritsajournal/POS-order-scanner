import { z } from 'zod';

export const productSearchSchema = z.object({
  query: z.string().min(1),
  category: z.string().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0),
});

export type ProductSearchInput = z.infer<typeof productSearchSchema>;
