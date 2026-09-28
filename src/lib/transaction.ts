import { z } from "zod";
import type { CategoryKey } from "../constants/categories";

export const createTransactionSchema = z.object({
  type: z.enum(["EXPENSE", "INCOME"]),
  amount: z.string(),
  category: z.custom<CategoryKey>((cat) => typeof cat === "string"),
  accountId: z.string().min(1, "Select an account."),
  date: z.date(),
  description: z.string().optional(),
});

export type TCreateTransactionType = z.infer<typeof createTransactionSchema>;
