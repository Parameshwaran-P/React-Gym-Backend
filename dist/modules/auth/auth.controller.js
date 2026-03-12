"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const response_util_1 = require("../../common/utils/response.util");
const notification_service_1 = require("../../modules/notifications/services/notification.service");
const client_1 = require("@prisma/client");
class AuthController {
    constructor() {
        this.register = async (req, res, next) => {
            try {
                const result = await this.authService.register(req.body);
                const notificationService = new notification_service_1.NotificationService();
                console.log("result", result);
                await notificationService.sendNotification({
                    userId: result.user.id,
                    type: client_1.NotificationType.REGISTRATION_SUCCESS,
                    title: 'Welcome to Gamified Learning!',
                    message: 'Thank you for registering. We are excited to have you on board!',
                    channels: ['EMAIL'],
                    metadata: {
                        name: result.user.displayName,
                        loginUrl: 'https://react-gym-eight.vercel.app/',
                    },
                });
                console.log('   ✅ Notification queued successfully');
                res.status(201).json((0, response_util_1.successResponse)(result));
            }
            catch (error) {
                next(error);
            }
        };
        this.login = async (req, res, next) => {
            try {
                const result = await this.authService.login(req.body);
                const notificationService = new notification_service_1.NotificationService();
                await notificationService.sendNotification({
                    userId: result.user.id,
                    type: client_1.NotificationType.LOGIN_SUCCESS,
                    title: 'New Login Detected',
                    message: 'Your account was successfully logged in.',
                    channels: ['EMAIL'],
                    metadata: {
                        name: result.user.displayName,
                        device: req.headers['user-agent'],
                        location: req.ip,
                        time: new Date().toLocaleString(),
                        securityUrl: 'https://react-gym-eight.vercel.app/security'
                    },
                });
                res.status(200).json((0, response_util_1.successResponse)(result));
            }
            catch (error) {
                next(error);
            }
        };
        this.forgotPassword = async (req, res, next) => {
            try {
                const { email } = req.body;
                const result = await this.authService.forgotPassword(email);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.resetPassword = async (req, res, next) => {
            try {
                const { token, newPassword } = req.body;
                const result = await this.authService.resetPassword(token, newPassword);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.authService = new auth_service_1.AuthService();
    }
}
exports.AuthController = AuthController;
