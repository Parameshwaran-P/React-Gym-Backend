"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationQueue = void 0;
const bullmq_1 = require("bullmq");
const notification_config_1 = require("../../../config/notification.config");
const logger_1 = __importDefault(require("../../../config/logger"));
class NotificationQueue {
    constructor() {
        this.queue = null;
        this.worker = null;
        this.inMemoryQueue = [];
        this.isProcessing = false;
        if (notification_config_1.notificationConfig.queue.useQueue && notification_config_1.notificationConfig.queue.redisUrl) {
            this.initializeRedisQueue();
        }
        else {
            logger_1.default.info('Using in-memory queue (no Redis)');
        }
    }
    initializeRedisQueue() {
        try {
            this.queue = new bullmq_1.Queue('notifications', {
                connection: {
                    url: notification_config_1.notificationConfig.queue.redisUrl,
                },
            });
            logger_1.default.info('Redis queue initialized');
        }
        catch (error) {
            logger_1.default.error('Failed to initialize Redis queue, falling back to in-memory', {
                error: error.message,
            });
        }
    }
    async addJob(job, priority = 'NORMAL') {
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
        }
        else {
            // Use in-memory queue
            this.inMemoryQueue.push(job);
            this.processInMemoryQueue();
        }
    }
    async processInMemoryQueue() {
        if (this.isProcessing || this.inMemoryQueue.length === 0) {
            return;
        }
        this.isProcessing = true;
        while (this.inMemoryQueue.length > 0) {
            const job = this.inMemoryQueue.shift();
            if (job) {
                try {
                    // Import processor to avoid circular dependency
                    const { processNotificationJob } = await Promise.resolve().then(() => __importStar(require('./notification.processor')));
                    await processNotificationJob(job);
                }
                catch (error) {
                    logger_1.default.error('In-memory queue processing failed', {
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
    startWorker(processor) {
        if (!this.queue) {
            logger_1.default.warn('Cannot start worker without Redis queue');
            return;
        }
        this.worker = new bullmq_1.Worker('notifications', async (job) => {
            await processor(job);
        }, {
            connection: {
                url: notification_config_1.notificationConfig.queue.redisUrl,
            },
            concurrency: 5,
        });
        this.worker.on('completed', (job) => {
            logger_1.default.info('Job completed', { jobId: job.id });
        });
        this.worker.on('failed', (job, err) => {
            logger_1.default.error('Job failed', { jobId: job?.id, error: err.message });
        });
        logger_1.default.info('Notification worker started');
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
exports.NotificationQueue = NotificationQueue;
