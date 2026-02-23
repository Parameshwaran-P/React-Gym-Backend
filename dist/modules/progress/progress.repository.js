"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressRepository = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
class ProgressRepository {
    async findProgress(userId, courseId, tx) {
        const client = tx || prisma_1.default;
        return client.courseProgress.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
        });
    }
    async upsertProgress(data, tx) {
        const client = tx || prisma_1.default;
        const updateData = { ...data };
        delete updateData.userId;
        delete updateData.courseId;
        return client.courseProgress.upsert({
            where: {
                userId_courseId: {
                    userId: data.userId,
                    courseId: data.courseId,
                },
            },
            update: updateData,
            create: data,
        });
    }
}
exports.ProgressRepository = ProgressRepository;
