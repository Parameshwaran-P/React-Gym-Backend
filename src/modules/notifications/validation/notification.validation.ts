import { z } from 'zod';
import { NotificationType, NotificationChannel } from '@prisma/client';

export const sendNotificationSchema = z.object({
  body: z.object({
    userId: z.string().uuid('Invalid user ID'),
    type: z.nativeEnum(NotificationType),
    title: z.string().min(1, 'Title is required'),
    message: z.string().min(1, 'Message is required'),
    channels: z.array(z.nativeEnum(NotificationChannel)).min(1, 'At least one channel is required'),
    metadata: z.record(z.string(), z.any()).optional(),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH']).optional(),
  }),
});

export const bulkNotificationSchema = z.object({
  body: z.object({
    userIds: z.array(z.string().uuid()).min(1, 'At least one user ID is required'),
    type: z.nativeEnum(NotificationType),
    title: z.string().min(1, 'Title is required'),
    message: z.string().min(1, 'Message is required'),
    channels: z.array(z.nativeEnum(NotificationChannel)).min(1, 'At least one channel is required'),
     metadata: z.record(z.string(), z.any()).optional(),
  }),
});

export const getUserNotificationsSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(Number),
    limit: z.string().optional().transform(Number),
    unreadOnly: z.string().optional().transform((val) => val === 'true'),
  }),
});

export const updatePreferencesSchema = z.object({
  body: z.object({
    emailEnabled: z.boolean().optional(),
    whatsappEnabled: z.boolean().optional(),
    pushEnabled: z.boolean().optional(),
    coursePurchased: z.boolean().optional(),
    paymentAlerts: z.boolean().optional(),
    systemAlerts: z.boolean().optional(),
  }),
});

export const registerDeviceTokenSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
    platform: z.enum(['web', 'ios', 'android']),
  }),
});