import { Queue, Worker, Job } from 'bullmq';
import { NotificationJob } from '../types/notification.types';
import { notificationConfig } from '../../../config/notification.config';
import logger from '../../../config/logger';

export class NotificationQueue {
  private queue: Queue | null = null;
  private worker: Worker | null = null;
  private inMemoryQueue: NotificationJob[] = [];
  private isProcessing: boolean = false;

  constructor() {
    if (notificationConfig.queue.useQueue && notificationConfig.queue.redisUrl) {
      this.initializeRedisQueue();
    } else {
      logger.info('Using in-memory queue (no Redis)');
    }
  }

  private initializeRedisQueue() {
    try {
      this.queue = new Queue('notifications', {
        connection: {
          url: notificationConfig.queue.redisUrl,
        },
      });

      logger.info('Redis queue initialized');
    } catch (error: any) {
      logger.error('Failed to initialize Redis queue, falling back to in-memory', {
        error: error.message,
      });
    }
  }

  async addJob(job: NotificationJob, priority: string = 'NORMAL'): Promise<void> {
    if (this.queue) {
      // Use Redis queue
      await this.queue.add('send-notification', job, {
        priority: priority === 'HIGH' ? 1 : priority === 'LOW' ? 10 : 5,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      });
    } else {
      // Use in-memory queue
      this.inMemoryQueue.push(job);
      this.processInMemoryQueue();
    }
  }

  private async processInMemoryQueue() {
    if (this.isProcessing || this.inMemoryQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.inMemoryQueue.length > 0) {
      const job = this.inMemoryQueue.shift();
      if (job) {
        try {
          // Import processor to avoid circular dependency
          const { processNotificationJob } = await import('./notification.processor');
          await processNotificationJob(job);
        } catch (error: any) {
          logger.error('In-memory queue processing failed', {
            error: error.message,
            job,
          });
        }
      }

      // Small delay between jobs
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.isProcessing = false;
  }

  startWorker(processor: (job: Job<NotificationJob>) => Promise<void>) {
    if (!this.queue) {
      logger.warn('Cannot start worker without Redis queue');
      return;
    }

    this.worker = new Worker(
      'notifications',
      async (job: Job<NotificationJob>) => {
        await processor(job);
      },
      {
        connection: {
          url: notificationConfig.queue.redisUrl,
        },
        concurrency: 5,
      }
    );

    this.worker.on('completed', (job) => {
      logger.info('Job completed', { jobId: job.id });
    });

    this.worker.on('failed', (job, err) => {
      logger.error('Job failed', { jobId: job?.id, error: err.message });
    });

    logger.info('Notification worker started');
  }

  async close() {
    if (this.worker) {
      await this.worker.close();
    }
    if (this.queue) {
      await this.queue.close();
    }
  }
}