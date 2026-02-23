"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeStepSchema = void 0;
const zod_1 = require("zod");
exports.completeStepSchema = zod_1.z.object({
    body: zod_1.z.object({
        courseId: zod_1.z.string().uuid(),
        stepKey: zod_1.z.string().min(1),
        userAnswer: zod_1.z.any().optional(),
        score: zod_1.z.number().min(0).max(100).optional(),
        timeSpent: zod_1.z.number().min(0).optional(),
    }),
});
