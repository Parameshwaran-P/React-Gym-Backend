"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
// import { authMiddleware } from '@/middleware/auth.middleware';
// import { validate } from '@/middleware/validation.middleware';
const auth_middleware_1 = require("../../../middleware/auth.middleware");
const validation_middleware_1 = require("../../../middleware/validation.middleware");
const notification_validation_1 = require("../validation/notification.validation");
const rbac_middleware_1 = require("../../../middleware/rbac.middleware");
const client_1 = require("@prisma/client");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = (0, express_1.Router)();
const notificationController = new notification_controller_1.NotificationController();
// Rate limiter
const notificationLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    message: 'Too many notification requests, please try again later',
});
// Admin/System routes
router.post('/send', auth_middleware_1.authMiddleware, (0, rbac_middleware_1.requireRole)(client_1.Role.ADMIN, client_1.Role.CONTENT_EDITOR), notificationLimiter, (0, validation_middleware_1.validate)(notification_validation_1.sendNotificationSchema), notificationController.sendNotification);
router.post('/bulk', auth_middleware_1.authMiddleware, (0, rbac_middleware_1.requireRole)(client_1.Role.ADMIN), (0, validation_middleware_1.validate)(notification_validation_1.bulkNotificationSchema), notificationController.sendBulkNotifications);
// User routes
router.get('/user/:userId', auth_middleware_1.authMiddleware, (0, validation_middleware_1.validate)(notification_validation_1.getUserNotificationsSchema), notificationController.getUserNotifications);
router.patch('/:id/read', auth_middleware_1.authMiddleware, notificationController.markAsRead);
router.patch('/mark-all-read', auth_middleware_1.authMiddleware, notificationController.markAllAsRead);
router.patch('/preferences', auth_middleware_1.authMiddleware, (0, validation_middleware_1.validate)(notification_validation_1.updatePreferencesSchema), notificationController.updatePreferences);
router.post('/device-token', auth_middleware_1.authMiddleware, (0, validation_middleware_1.validate)(notification_validation_1.registerDeviceTokenSchema), notificationController.registerDeviceToken);
router.delete('/device-token', auth_middleware_1.authMiddleware, notificationController.unregisterDeviceToken);
exports.default = router;
