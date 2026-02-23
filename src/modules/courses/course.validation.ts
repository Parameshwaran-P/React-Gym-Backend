import { z } from 'zod';
import { CourseDifficulty, CourseStatus } from '@prisma/client';

export const createCourseSchema = z.object({
  body: z.object({
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
    title: z.string().min(1),
    description: z.string().optional(),
    difficulty: z.nativeEnum(CourseDifficulty),
    estimatedHours: z.number().min(1),
    totalXp: z.number().min(0),
    previewVideoUrl: z.string().url().optional(),
    thumbnailUrl: z.string().url().optional(),
    stepsDefinition: z.record(z.string(), z.any()),
    tags: z.array(z.string()).optional(),
  }),
});

export const getCourseListSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    difficulty: z.nativeEnum(CourseDifficulty).optional(),
    tag: z.string().optional(),
    status: z.nativeEnum(CourseStatus).optional(),
  }),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>['body'];