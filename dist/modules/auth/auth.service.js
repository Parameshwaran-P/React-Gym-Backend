"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const auth_repository_1 = require("./auth.repository");
const password_util_1 = require("../../common/utils/password.util");
const jwt_util_1 = require("../../common/utils/jwt.util");
const AppError_1 = require("../../common/errors/AppError");
const reset_token_1 = require("../../utils/reset-token");
const notification_service_1 = require("../../modules/notifications/services/notification.service");
const client_1 = require("@prisma/client");
// import { NotificationService } from '../../modules/notification/notification.service';
class AuthService {
    // private notificationService: NotificationService;
    constructor() {
        this.authRepository = new auth_repository_1.AuthRepository();
        // this.notificationService = new NotificationService();
    }
    async register(input) {
        // Check if user exists
        const existingUser = await this.authRepository.findUserByEmail(input.email);
        if (existingUser) {
            throw new AppError_1.ConflictError('Email already exists', 'EMAIL_ALREADY_EXISTS');
        }
        // Hash password
        const passwordHash = await (0, password_util_1.hashPassword)(input.password);
        // Create user
        const user = await this.authRepository.createUser({
            email: input.email,
            passwordHash,
            displayName: input.displayName,
        });
        // Generate token
        const token = (0, jwt_util_1.generateToken)(user.id, user.email, user.role);
        return {
            user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                role: user.role,
                totalXp: user.totalXp,
                level: user.level,
                currentStreak: user.currentStreak,
            },
            token,
        };
    }
    async login(input) {
        // Find user
        const user = await this.authRepository.findUserByEmail(input.email);
        if (!user) {
            throw new AppError_1.UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
        }
        // Verify password
        const isValid = await (0, password_util_1.verifyPassword)(input.password, user.passwordHash);
        if (!isValid) {
            throw new AppError_1.UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
        }
        // Check if active
        if (!user.isActive) {
            throw new AppError_1.UnauthorizedError('Account is inactive', 'ACCOUNT_INACTIVE');
        }
        // Generate token
        const token = (0, jwt_util_1.generateToken)(user.id, user.email, user.role);
        return {
            user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                role: user.role,
                totalXp: user.totalXp,
                level: user.level,
                currentStreak: user.currentStreak,
            },
            token,
        };
    }
    async forgotPassword(email) {
        const user = await this.authRepository.findUserByEmail(email);
        const genericResponse = {
            message: 'If the email exists, a reset link has been sent.',
        };
        if (!user || !user.isActive) {
            return genericResponse;
        }
        const rawToken = (0, reset_token_1.generateResetToken)();
        const tokenHash = (0, reset_token_1.hashResetToken)(rawToken);
        const expiry = new Date(Date.now() + 15 * 60 * 1000);
        await this.authRepository.updateUser(user.id, {
            resetTokenHash: tokenHash,
            resetTokenExpiresAt: expiry,
        });
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;
        console.log('Generated reset link:', resetLink);
        const notificationService = new notification_service_1.NotificationService();
        await notificationService.sendNotification({
            userId: user.id,
            type: client_1.NotificationType.FORGOT_PASSWORD,
            title: 'Reset Your Password',
            message: 'Click the link to reset your password.',
            channels: ['EMAIL'],
            metadata: {
                name: user.displayName,
                resetUrl: resetLink,
            },
        });
        return genericResponse;
    }
    async resetPassword(token, newPassword) {
        const tokenHash = (0, reset_token_1.hashResetToken)(token);
        const user = await this.authRepository.findByResetTokenHash(tokenHash);
        if (!user) {
            throw new AppError_1.UnauthorizedError('Invalid or expired reset token');
        }
        if (!user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
            throw new AppError_1.UnauthorizedError('Reset token expired');
        }
        if (!user.isActive) {
            throw new AppError_1.UnauthorizedError('Account inactive');
        }
        const passwordHash = await (0, password_util_1.hashPassword)(newPassword);
        await this.authRepository.updateUser(user.id, {
            passwordHash,
            resetTokenHash: null,
            resetTokenExpiresAt: null,
            passwordChangedAt: new Date(),
        });
        return { message: 'Password reset successful' };
    }
}
exports.AuthService = AuthService;
