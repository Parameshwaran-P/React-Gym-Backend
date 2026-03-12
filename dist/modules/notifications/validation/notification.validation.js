"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDeviceTokenSchema = exports.updatePreferencesSchema = exports.getUserNotificationsSchema = exports.bulkNotificationSchema = exports.sendNotificationSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.sendNotificationSchema = zod_1.z.object({
    body: zod_1.z.object({
        userId: zod_1.z.string().uuid('Invalid user ID'),
        type: zod_1.z.nativeEnum(client_1.NotificationType),
        title: zod_1.z.string().min(1, 'Title is required'),
        message: zod_1.z.string().min(1, 'Message is required'),
        channels: zod_1.z.array(zod_1.z.nativeEnum(client_1.NotificationChannel)).min(1, 'At least one channel is required'),
        metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
        priority: zod_1.z.enum(['LOW', 'NORMAL', 'HIGH']).optional(),
    }),
});
exports.bulkNotificationSchema = zod_1.z.object({
    body: zod_1.z.object({
        userIds: zod_1.z.array(zod_1.z.string().uuid()).min(1, 'At least one user ID is required'),
        type: zod_1.z.nativeEnum(client_1.NotificationType),
        title: zod_1.z.string().min(1, 'Title is required'),
        message: zod_1.z.string().min(1, 'Message is required'),
        channels: zod_1.z.array(zod_1.z.nativeEnum(client_1.NotificationChannel)).min(1, 'At least one channel is required'),
        metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    }),
});
exports.getUserNotificationsSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional().transform(Number),
        limit: zod_1.z.string().optional().transform(Number),
        unreadOnly: zod_1.z.string().optional().transform((val) => val === 'true'),
    }),
});
exports.updatePreferencesSchema = zod_1.z.object({
    body: zod_1.z.object({
        emailEnabled: zod_1.z.boolean().optional(),
        whatsappEnabled: zod_1.z.boolean().optional(),
        pushEnabled: zod_1.z.boolean().optional(),
        coursePurchased: zod_1.z.boolean().optional(),
        paymentAlerts: zod_1.z.boolean().optional(),
        systemAlerts: zod_1.z.boolean().optional(),
    }),
});
exports.registerDeviceTokenSchema = zod_1.z.object({
    body: zod_1.z.object({
        token: zod_1.z.string().min(1, 'Token is required'),
        platform: zod_1.z.enum(['web', 'ios', 'android']),
    }),
});
