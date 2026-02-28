import { Job } from 'bullmq';
import { NotificationJob } from '../types/notification.types';
import { NotificationService } from '../services/notification.service';

const notificationService = new NotificationService();

export async function processNotificationJob(
  job: Job<NotificationJob> | NotificationJob
): Promise<void> {
  const jobData = 'data' in job ? job.data : job;
  await notificationService.processNotification(jobData);
}