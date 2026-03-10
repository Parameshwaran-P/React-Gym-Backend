import { NotificationType, NotificationChannel, NotificationStatus } from '@prisma/client';

export interface SendNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  channels: NotificationChannel[];
  metadata?: Record<string, any>;
  priority?: 'LOW' | 'NORMAL' | 'HIGH';
}

export interface BulkNotificationInput {
  userIds: string[];
  type: NotificationType;
  title: string;
  message: string;
  channels: NotificationChannel[];
  metadata?: Record<string, any>;
}

export interface NotificationJob {
  notificationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  metadata?: Record<string, any>;
  retryCount: number;
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface WhatsAppData {
  to: string;
  message: string;
  templateName?: string;
  templateParams?: string[];
}

export interface PushData {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface NotificationTemplate {
  subject?: string;
  html?: string;
  text?: string;
  whatsappMessage?: string;
}