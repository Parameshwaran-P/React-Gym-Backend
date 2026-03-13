import prisma from '../../../config/prisma';
import {
  Notification,
  NotificationPreference,
  NotificationType,
  NotificationChannel,
  NotificationStatus,
  Prisma,
  DeviceToken,
} from '@prisma/client';

export class NotificationRepository {
  async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    channel: NotificationChannel;
    metadata?: any;
  }): Promise<Notification> {
    return prisma.notification.create({
      data,
    });
  }

  async updateNotificationStatus(
    id: string,
    status: NotificationStatus,
    error?: string,
    sentAt?: Date
  ): Promise<Notification> {
    return prisma.notification.update({
      where: { id },
      data: {
        status,
        error,
        sentAt,
      },
    });
  }

  async incrementRetryCount(id: string): Promise<Notification> {
    return prisma.notification.update({
      where: { id },
      data: {
        retryCount: { increment: 1 },
      },
    });
  }

  async getNotificationById(id: string): Promise<Notification | null> {
    return prisma.notification.findUnique({
      where: { id },
    });
  }

  async getUserNotifications(
    userId: string,
    params: {
      skip?: number;
      take?: number;
      unreadOnly?: boolean;
    }
  ): Promise<{ notifications: Notification[]; total: number }> {
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(params.unreadOnly && { isRead: false }),
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    return { notifications, total };
  }

  async markAsRead(id: string): Promise<Notification> {
    return prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
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

  async getPreferences(userId: string): Promise<NotificationPreference | null> {
    return prisma.notificationPreference.findUnique({
      where: { userId },
    });
  }

  async createOrUpdatePreferences(
    userId: string,
    preferences: Partial<NotificationPreference>
  ): Promise<NotificationPreference> {
    return prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        ...preferences,
      },
      update: preferences,
    });
  }

  async getUserDeviceTokens(userId: string): Promise<DeviceToken[]> {
    return prisma.deviceToken.findMany({
      where: {
        userId,
        isActive: true,
      },
    });
  }

  async addDeviceToken(
    userId: string,
    token: string,
    platform: string
  ): Promise<DeviceToken> {
    return prisma.deviceToken.upsert({
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

  async removeDeviceToken(token: string): Promise<void> {
    await prisma.deviceToken.update({
      where: { token },
      data: { isActive: false },
    });
  }

  async getPendingNotifications(limit: number = 100): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: {
        status: { in: ['PENDING', 'RETRYING'] },
      },
      take: limit,
      orderBy: { createdAt: 'asc' },
    });
  }
}