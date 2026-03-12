"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const notification_repository_1 = require("../repositories/notification.repository");
const email_service_1 = require("./email.service");
const client_1 = require("@prisma/client");
const notification_queue_1 = require("../queues/notification.queue");
const template_util_1 = require("../utils/template.util");
const logger_1 = __importDefault(require("@/config/logger"));
const prisma_1 = __importDefault(require("@/config/prisma"));
class NotificationService {
    constructor() {
        this.repository = new notification_repository_1.NotificationRepository();
        this.emailService = new email_service_1.EmailService();
        // this.whatsappService = new WhatsAppService();
        // this.pushService = new PushService();
        this.queue = new notification_queue_1.NotificationQueue();
    }
    async sendNotification(input) {
        // Get user preferences
        const preferences = await this.repository.getPreferences(input.userId);
        // Filter channels based on preferences
        const enabledChannels = this.filterChannelsByPreferences(input.channels, preferences);
        if (enabledChannels.length === 0) {
            logger_1.default.info('No enabled channels for user', { userId: input.userId });
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
            const job = {
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
        logger_1.default.info('Notifications queued', {
            userId: input.userId,
            channels: enabledChannels,
        });
    }
    async sendBulkNotifications(input) {
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
        logger_1.default.info('Bulk notifications queued', { count: input.userIds.length });
    }
    async processNotification(job) {
        try {
            logger_1.default.info('Processing notification', {
                notificationId: job.notificationId,
                channel: job.channel,
            });
            switch (job.channel) {
                case client_1.NotificationChannel.EMAIL:
                    await this.sendEmailNotification(job);
                    break;
                case client_1.NotificationChannel.WHATSAPP:
                    await this.sendWhatsAppNotification(job);
                    break;
                case client_1.NotificationChannel.PUSH:
                    await this.sendPushNotificationToUser(job);
                    break;
            }
            await this.repository.updateNotificationStatus(job.notificationId, 'SENT', undefined, new Date());
            logger_1.default.info('Notification sent successfully', {
                notificationId: job.notificationId,
            });
        }
        catch (error) {
            logger_1.default.error('Notification processing failed', {
                notificationId: job.notificationId,
                error: error.message,
            });
            await this.handleNotificationFailure(job, error.message);
        }
    }
    async sendEmailNotification(job) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: job.userId },
            select: { email: true },
        });
        if (!user?.email) {
            throw new Error('User email not found');
        }
        const template = (0, template_util_1.getNotificationTemplate)(job.type, job.metadata);
        await this.emailService.sendEmail({
            to: user.email,
            subject: template.subject || job.title,
            html: template.html || `<p>${job.message}</p>`,
            text: template.text || job.message,
        });
    }
    async sendWhatsAppNotification(job) {
        const user = await prisma_1.default.user.findUnique({
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
    async sendPushNotificationToUser(job) {
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
    async handleNotificationFailure(job, error) {
        await this.repository.incrementRetryCount(job.notificationId);
        const notification = await this.repository.getNotificationById(job.notificationId);
        if (!notification)
            return;
        // Check retry limit
        const maxRetries = 3;
        if (notification.retryCount >= maxRetries) {
            await this.repository.updateNotificationStatus(job.notificationId, 'FAILED', error);
            logger_1.default.error('Notification failed after max retries', {
                notificationId: job.notificationId,
            });
        }
        else {
            await this.repository.updateNotificationStatus(job.notificationId, 'RETRYING', error);
            // Re-queue with exponential backoff
            const delay = Math.pow(2, notification.retryCount) * 5000;
            setTimeout(() => {
                this.queue.addJob({ ...job, retryCount: notification.retryCount });
            }, delay);
            logger_1.default.info('Notification queued for retry', {
                notificationId: job.notificationId,
                retryCount: notification.retryCount,
                delay,
            });
        }
    }
    filterChannelsByPreferences(channels, preferences) {
        if (!preferences) {
            // Default: enable all channels if no preferences set
            return channels;
        }
        return channels.filter((channel) => {
            switch (channel) {
                case client_1.NotificationChannel.EMAIL:
                    return preferences.emailEnabled;
                case client_1.NotificationChannel.WHATSAPP:
                    return preferences.whatsappEnabled;
                case client_1.NotificationChannel.PUSH:
                    return preferences.pushEnabled;
                default:
                    return false;
            }
        });
    }
    async getUserNotifications(userId, page = 1, limit = 20, unreadOnly = false) {
        const skip = (page - 1) * limit;
        return this.repository.getUserNotifications(userId, {
            skip,
            take: limit,
            unreadOnly,
        });
    }
    async markAsRead(notificationId) {
        await this.repository.markAsRead(notificationId);
    }
    async markAllAsRead(userId) {
        await this.repository.markAllAsRead(userId);
    }
    async updatePreferences(userId, preferences) {
        await this.repository.createOrUpdatePreferences(userId, preferences);
    }
    async registerDeviceToken(userId, token, platform) {
        await this.repository.addDeviceToken(userId, token, platform);
    }
    async unregisterDeviceToken(token) {
        await this.repository.removeDeviceToken(token);
    }
}
exports.NotificationService = NotificationService;
