"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processNotificationJob = processNotificationJob;
const notification_service_1 = require("../services/notification.service");
const notificationService = new notification_service_1.NotificationService();
async function processNotificationJob(job) {
    const jobData = 'data' in job ? job.data : job;
    await notificationService.processNotification(jobData);
}
