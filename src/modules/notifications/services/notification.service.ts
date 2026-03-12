import { NotificationRepository } from '../repositories/notification.repository';
import { EmailService } from './email.service';
// import { WhatsAppService } from './whatsapp.service';
// import { PushService } from './push.service';
import {
  SendNotificationInput,
  BulkNotificationInput,
  NotificationJob,
} from '../types/notification.types';
import { NotificationChannel, NotificationType } from '@prisma/client';
import { NotificationQueue } from '../queues/notification.queue';
import { getNotificationTemplate } from '../utils/template.util';
import logger from '@/config/logger';
import prisma from '@/config/prisma';

export class NotificationService {
  private repository: NotificationRepository;
  private emailService: EmailService;
  // private whatsappService: WhatsAppService;
  // private pushService: PushService;
  private queue: NotificationQueue;

  constructor() {
    this.repository = new NotificationRepository();
    this.emailService = new EmailService();
    // this.whatsappService = new WhatsAppService();
    // this.pushService = new PushService();
    this.queue = new NotificationQueue();
  }

  async sendNotification(input: SendNotificationInput): Promise<void> {
    // Get user preferences
    const preferences = await this.repository.getPreferences(input.userId);

    // Filter channels based on preferences
    const enabledChannels = this.filterChannelsByPreferences(
      input.channels,
      preferences
    );

    if (enabledChannels.length === 0) {
      logger.info('No enabled channels for user', { userId: input.userId });
      return;
    }

    // Create notification records for each channel
    for (const channel of enabledChannels) {
      const notification = await this.repository.createNotification({
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        channel,
        metadata: input.metadata,
      });

      // Queue the notification job
      const job: NotificationJob = {
        notificationId: notification.id,
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        channel,
        metadata: input.metadata,
        retryCount: 0,
      };

      await this.queue.addJob(job, input.priority);
    }

    logger.info('Notifications queued', {
      userId: input.userId,
      channels: enabledChannels,
    });
  }

  async sendBulkNotifications(input: BulkNotificationInput): Promise<void> {
    for (const userId of input.userIds) {
      await this.sendNotification({
        userId,
        type: input.type,
        title: input.title,
        message: input.message,
        channels: input.channels,
        metadata: input.metadata,
      });
    }

    logger.info('Bulk notifications queued', { count: input.userIds.length });
  }

  async processNotification(job: NotificationJob): Promise<void> {
    try {
      logger.info('Processing notification', {
        notificationId: job.notificationId,
        channel: job.channel,
      });

      switch (job.channel) {
        case NotificationChannel.EMAIL:
          await this.sendEmailNotification(job);
          break;
        case NotificationChannel.WHATSAPP:
          await this.sendWhatsAppNotification(job);
          break;
        case NotificationChannel.PUSH:
          await this.sendPushNotificationToUser(job);
          break;
      }

      await this.repository.updateNotificationStatus(
        job.notificationId,
        'SENT',
        undefined,
        new Date()
      );

      logger.info('Notification sent successfully', {
        notificationId: job.notificationId,
      });
    } catch (error: any) {
      logger.error('Notification processing failed', {
        notificationId: job.notificationId,
        error: error.message,
      });

      await this.handleNotificationFailure(job, error.message);
    }
  }

  private async sendEmailNotification(job: NotificationJob): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: job.userId },
      select: { email: true },
    });

    if (!user?.email) {
      throw new Error('User email not found');
    }

    const template = getNotificationTemplate(job.type, job.metadata);

    await this.emailService.sendEmail({
      to: user.email,
      subject: template.subject || job.title,
      html: template.html || `<p>${job.message}</p>`,
      text: template.text || job.message,
    });
  }

  private async sendWhatsAppNotification(job: NotificationJob): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: job.userId },
      // Assuming you have a phone field in User model
      select: { email: true }, // Replace with phone field
    });

    if (!user) {
      throw new Error('User not found');
    }

    // For production, use approved templates
    // For testing, you can send simple messages in sandbox mode
    // await this.whatsappService.sendMessage({
    //   to: user.email, // Replace with actual phone number field
    //   message: `${job.title}\n\n${job.message}`,
    //   // templateName: 'your_approved_template',
    //   // templateParams: [job.title, job.message],
    // });
  }

  private async sendPushNotificationToUser(job: NotificationJob): Promise<void> {
    const deviceTokens = await this.repository.getUserDeviceTokens(job.userId);

    if (deviceTokens.length === 0) {
      throw new Error('No device tokens found for user');
    }

    // await this.pushService.sendPushNotification({
    //   tokens: deviceTokens.map((dt) => dt.token),
    //   title: job.title,
    //   body: job.message,
    //   data: {
    //     notificationId: job.notificationId,
    //     type: job.type,
    //     ...(job.metadata || {}),
    //   },
    // });
  }

  private async handleNotificationFailure(
    job: NotificationJob,
    error: string
  ): Promise<void> {
    await this.repository.incrementRetryCount(job.notificationId);

    const notification = await this.repository.getNotificationById(
      job.notificationId
    );

    if (!notification) return;

    // Check retry limit
    const maxRetries = 3;
    if (notification.retryCount >= maxRetries) {
      await this.repository.updateNotificationStatus(
        job.notificationId,
        'FAILED',
        error
      );
      logger.error('Notification failed after max retries', {
        notificationId: job.notificationId,
      });
    } else {
      await this.repository.updateNotificationStatus(
        job.notificationId,
        'RETRYING',
        error
      );

      // Re-queue with exponential backoff
      const delay = Math.pow(2, notification.retryCount) * 5000;
      setTimeout(() => {
        this.queue.addJob({ ...job, retryCount: notification.retryCount });
      }, delay);

      logger.info('Notification queued for retry', {
        notificationId: job.notificationId,
        retryCount: notification.retryCount,
        delay,
      });
    }
  }

  private filterChannelsByPreferences(
    channels: NotificationChannel[],
    preferences: any
  ): NotificationChannel[] {
    if (!preferences) {
      // Default: enable all channels if no preferences set
      return channels;
    }

    return channels.filter((channel) => {
      switch (channel) {
        case NotificationChannel.EMAIL:
          return preferences.emailEnabled;
        case NotificationChannel.WHATSAPP:
          return preferences.whatsappEnabled;
        case NotificationChannel.PUSH:
          return preferences.pushEnabled;
        default:
          return false;
      }
    });
  }

  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false
  ) {
    const skip = (page - 1) * limit;

    return this.repository.getUserNotifications(userId, {
      skip,
      take: limit,
      unreadOnly,
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.repository.markAsRead(notificationId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repository.markAllAsRead(userId);
  }

  async updatePreferences(
    userId: string,
    preferences: any
  ): Promise<void> {
    await this.repository.createOrUpdatePreferences(userId, preferences);
  }

  async registerDeviceToken(
    userId: string,
    token: string,
    platform: string
  ): Promise<void> {
    await this.repository.addDeviceToken(userId, token, platform);
  }

  async unregisterDeviceToken(token: string): Promise<void> {
    await this.repository.removeDeviceToken(token);
  }
}