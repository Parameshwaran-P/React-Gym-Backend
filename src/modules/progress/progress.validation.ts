import { z } from 'zod';

export const completeStepSchema = z.object({
  body: z.object({
    courseId: z.string().uuid(),
    stepKey: z.string().min(1),
    userAnswer: z.any().optional(),
    score: z.number().min(0).max(100).optional(),
    timeSpent: z.number().min(0).optional(),
  }),
});

export type CompleteStepInput = z.infer<typeof completeStepSchema>['body'];