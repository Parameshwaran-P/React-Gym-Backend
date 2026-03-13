"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_service_1 = require("../services/notification.service");
// import { successResponse } from '@/common/utils/response.util';
const response_util_1 = require("../../../common/utils/response.util");
class NotificationController {
    constructor() {
        this.sendNotification = async (req, res, next) => {
            try {
                await this.notificationService.sendNotification(req.body);
                res.status(202).json((0, response_util_1.successResponse)({
                    message: 'Notification queued successfully',
                }));
            }
            catch (error) {
                next(error);
            }
        };
        this.sendBulkNotifications = async (req, res, next) => {
            try {
                await this.notificationService.sendBulkNotifications(req.body);
                res.status(202).json((0, response_util_1.successResponse)({
                    message: 'Bulk notifications queued successfully',
                    count: req.body.userIds.length,
                }));
            }
            catch (error) {
                next(error);
            }
        };
        this.getUserNotifications = async (req, res, next) => {
            try {
                const userId = req.params.userId;
                const { page = 1, limit = 20, unreadOnly = false } = req.query;
                const result = await this.notificationService.getUserNotifications(userId, page, limit, unreadOnly);
                res.json((0, response_util_1.successResponse)(result, {
                    pagination: {
                        page,
                        limit,
                        total: result.total,
                        totalPages: Math.ceil(result.total / limit),
                    },
                }));
            }
            catch (error) {
                next(error);
            }
        };
        this.markAsRead = async (req, res, next) => {
            try {
                await this.notificationService.markAsRead(req.params.id);
                res.json((0, response_util_1.successResponse)({
                    message: 'Notification marked as read',
                }));
            }
            catch (error) {
                next(error);
            }
        };
        this.markAllAsRead = async (req, res, next) => {
            try {
                const userId = req.user.id;
                await this.notificationService.markAllAsRead(userId);
                res.json((0, response_util_1.successResponse)({
                    message: 'All notifications marked as read',
                }));
            }
            catch (error) {
                next(error);
            }
        };
        this.updatePreferences = async (req, res, next) => {
            try {
                const userId = req.user.id;
                await this.notificationService.updatePreferences(userId, req.body);
                res.json((0, response_util_1.successResponse)({
                    message: 'Preferences updated successfully',
                }));
            }
            catch (error) {
                next(error);
            }
        };
        this.registerDeviceToken = async (req, res, next) => {
            try {
                const userId = req.user.id;
                const { token, platform } = req.body;
                await this.notificationService.registerDeviceToken(userId, token, platform);
                res.json((0, response_util_1.successResponse)({
                    message: 'Device token registered successfully',
                }));
            }
            catch (error) {
                next(error);
            }
        };
        this.unregisterDeviceToken = async (req, res, next) => {
            try {
                const { token } = req.body;
                await this.notificationService.unregisterDeviceToken(token);
                res.json((0, response_util_1.successResponse)({
                    message: 'Device token unregistered successfully',
                }));
            }
            catch (error) {
                next(error);
            }
        };
        this.notificationService = new notification_service_1.NotificationService();
    }
}
exports.NotificationController = NotificationController;
