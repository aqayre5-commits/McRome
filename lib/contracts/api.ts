import { z } from 'zod';

export const checkoutSchema = z.object({
  interval: z.enum(['monthly', 'yearly']),
  returnPath: z.string().startsWith('/').default('/account')
});

export const saveGameSchema = z.object({
  pageId: z.coerce.number().int().positive(),
  redirectTo: z.string().startsWith('/').default('/dashboard'),
  intent: z.enum(['save', 'remove']).default('save')
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  next: z.string().startsWith('/').default('/dashboard')
});

export const cronAuthSchema = z.object({
  secret: z.string().min(1)
});

export const betaTesterSignupSchema = z.object({
  email: z.string().email(),
  pageId: z.coerce.number().int().positive(),
  redirectTo: z.string().startsWith('/').default('/games'),
  countryCode: z.string().length(2).optional()
});

export const communityVerifySchema = z.object({
  pageId: z.coerce.number().int().positive(),
  redirectTo: z.string().startsWith('/').default('/games')
});

export const codeVoteSchema = z.object({
  codeId: z.number().int().positive(),
  isWorking: z.boolean()
});

export const codeReportSchema = z.object({
  codeId: z.number().int().positive()
});

export const geminiResponseSchema = z.object({
  answer_block: z.string(),
  summary: z.union([z.string(), z.array(z.string()).length(3)]),
  guide: z.string(),
  faqs: z.array(
    z.object({
      q: z.string(),
      a: z.string()
    })
  ).min(2).max(4)
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type SaveGameInput = z.infer<typeof saveGameSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GeminiResponse = z.infer<typeof geminiResponseSchema>;
export type BetaTesterSignupInput = z.infer<typeof betaTesterSignupSchema>;
export type CommunityVerifyInput = z.infer<typeof communityVerifySchema>;
export type CodeVoteInput = z.infer<typeof codeVoteSchema>;
export type CodeReportInput = z.infer<typeof codeReportSchema>;
