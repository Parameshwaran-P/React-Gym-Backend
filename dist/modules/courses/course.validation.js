"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCourseListSchema = exports.createCourseSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createCourseSchema = zod_1.z.object({
    body: zod_1.z.object({
        slug: zod_1.z.string().min(1).regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
        title: zod_1.z.string().min(1),
        description: zod_1.z.string().optional(),
        difficulty: zod_1.z.nativeEnum(client_1.CourseDifficulty),
        estimatedHours: zod_1.z.number().min(1),
        totalXp: zod_1.z.number().min(0),
        previewVideoUrl: zod_1.z.string().url().optional(),
        thumbnailUrl: zod_1.z.string().url().optional(),
        stepsDefinition: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
exports.getCourseListSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
        difficulty: zod_1.z.nativeEnum(client_1.CourseDifficulty).optional(),
        tag: zod_1.z.string().optional(),
        status: zod_1.z.nativeEnum(client_1.CourseStatus).optional(),
    }),
});
