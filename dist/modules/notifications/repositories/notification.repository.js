"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
class NotificationRepository {
    async createNotification(data) {
        return prisma_1.default.notification.create({
            data,
        });
    }
    async updateNotificationStatus(id, status, error, sentAt) {
        return prisma_1.default.notification.update({
            where: { id },
            data: {
                status,
                error,
                sentAt,
            },
        });
    }
    async incrementRetryCount(id) {
        return prisma_1.default.notification.update({
            where: { id },
            data: {
                retryCount: { increment: 1 },
            },
        });
    }
    async getNotificationById(id) {
        return prisma_1.default.notification.findUnique({
            where: { id },
        });
    }
    async getUserNotifications(userId, params) {
        const where = {
            userId,
            ...(params.unreadOnly && { isRead: false }),
        };
        const [notifications, total] = await Promise.all([
            prisma_1.default.notification.findMany({
                where,
                skip: params.skip,
                take: params.take,
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.default.notification.count({ where }),
        ]);
        return { notifications, total };
    }
    async markAsRead(id) {
        return prisma_1.default.notification.update({
            where: { id },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    }
    async markAllAsRead(userId) {
        const result = await prisma_1.default.notification.updateMany({
            where: {
                userId,
                isRead: false,
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
        return result.count;
    }
    async getPreferences(userId) {
        return prisma_1.default.notificationPreference.findUnique({
            where: { userId },
        });
    }
    async createOrUpdatePreferences(userId, preferences) {
        return prisma_1.default.notificationPreference.upsert({
            where: { userId },
            create: {
                userId,
                ...preferences,
            },
            update: preferences,
        });
    }
    async getUserDeviceTokens(userId) {
        return prisma_1.default.deviceToken.findMany({
            where: {
                userId,
                isActive: true,
            },
        });
    }
    async addDeviceToken(userId, token, platform) {
        return prisma_1.default.deviceToken.upsert({
            where: { token },
            create: {
                userId,
                token,
                platform,
            },
            update: {
                isActive: true,
                updatedAt: new Date(),
            },
        });
    }
    async removeDeviceToken(token) {
        await prisma_1.default.deviceToken.update({
            where: { token },
            data: { isActive: false },
        });
    }
    async getPendingNotifications(limit = 100) {
        return prisma_1.default.notification.findMany({
            where: {
                status: { in: ['PENDING', 'RETRYING'] },
            },
            take: limit,
            orderBy: { createdAt: 'asc' },
        });
    }
}
exports.NotificationRepository = NotificationRepository;
