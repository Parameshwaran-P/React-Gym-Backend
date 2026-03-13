import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
// import { authMiddleware } from '@/middleware/auth.middleware';
// import { validate } from '@/middleware/validation.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { validate } from '../../../middleware/validation.middleware';
import {
  sendNotificationSchema,
  bulkNotificationSchema,
  getUserNotificationsSchema,
  updatePreferencesSchema,
  registerDeviceTokenSchema,
} from '../validation/notification.validation';
import { requireRole } from '../../../middleware/rbac.middleware';
import { Role } from '@prisma/client';
import rateLimit from 'express-rate-limit';

const router = Router();
const notificationController = new NotificationController();

// Rate limiter
const notificationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many notification requests, please try again later',
});

// Admin/System routes
router.post(
  '/send',
  authMiddleware,
  requireRole(Role.ADMIN, Role.CONTENT_EDITOR),
  notificationLimiter,
  validate(sendNotificationSchema),
  notificationController.sendNotification
);

router.post(
  '/bulk',
  authMiddleware,
  requireRole(Role.ADMIN),
  validate(bulkNotificationSchema),
  notificationController.sendBulkNotifications
);

// User routes
router.get(
  '/user/:userId',
  authMiddleware,
  validate(getUserNotificationsSchema),
  notificationController.getUserNotifications
);

router.patch(
  '/:id/read',
  authMiddleware,
  notificationController.markAsRead
);

router.patch(
  '/mark-all-read',
  authMiddleware,
  notificationController.markAllAsRead
);

router.patch(
  '/preferences',
  authMiddleware,
  validate(updatePreferencesSchema),
  notificationController.updatePreferences
);

router.post(
  '/device-token',
  authMiddleware,
  validate(registerDeviceTokenSchema),
  notificationController.registerDeviceToken
);

router.delete(
  '/device-token',
  authMiddleware,
  notificationController.unregisterDeviceToken
);

export default router;