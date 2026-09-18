import { z } from "zod";

export const createSignInSchema = z.object({
  email: z.string().trim().min(1, "Email must required"),
  password: z.string().min(1, "Pasword must required"),
});

export type TSignInType = z.infer<typeof createSignInSchema>;

export const createSignUpSchema = z.object({
  firstName: z.string().trim().min(1, "First-Name must required"),
  lastName: z.string().trim().min(1, "Last-Name must required"),
  email: z.string().trim().min(1, "Email must required"),
  password: z.string().min(1, "Pasword must required"),
});

export type TSignUpType = z.infer<typeof createSignUpSchema>;

export const createVerificationSchema = z.object({
  code: z.string().trim().min(1, "Email must required"),
});

export type TVerificationCodeType = z.infer<typeof createVerificationSchema>;
