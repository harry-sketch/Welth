import { z } from "zod";

export const createOnboardingSchema = z.object({
  balance: z.string().trim().min(1, "amount must required"),
});

export type TOnboardingType = z.infer<typeof createOnboardingSchema>;
