import { z } from 'zod';

export const SocialsSchema = z.object({
  linkedin: z.string().url().optional(),
  twitter: z.string().url().optional(),
  github: z.string().url().optional(),
  instagram: z.string().url().optional(),
  youtube: z.string().url().optional()
});

export const FounderSchema = z.object({
  name: z.string(),
  title: z.string(),
  emails: z.array(z.string().email()),
  socials: SocialsSchema.optional(),
  personal_website: z.string().url().optional(),
  phone: z.string().optional(),
  confidence_score: z.number().min(0).max(1).optional(),
  cold_email_draft: z.string().optional(),
  cold_email_subject: z.string().optional(),
  lead_score: z.object({
    score: z.number().min(0).max(100),
    reasoning: z.string()
  }).optional()
});

export const CompanyOutputSchema = z.object({
  company: z.string(),
  website: z.string().url(),
  founders: z.array(FounderSchema)
});

export type Founder = z.infer<typeof FounderSchema>;
export type CompanyOutput = z.infer<typeof CompanyOutputSchema>;
export type Socials = z.infer<typeof SocialsSchema>;
