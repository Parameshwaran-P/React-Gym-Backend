"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const auth_repository_1 = require("./auth.repository");
const password_util_1 = require("@/common/utils/password.util");
const jwt_util_1 = require("@/common/utils/jwt.util");
const errors_1 = require("@/common/errors");
class AuthService {
    constructor() {
        this.authRepository = new auth_repository_1.AuthRepository();
    }
    async register(input) {
        // Check if user exists
        const existingUser = await this.authRepository.findUserByEmail(input.email);
        if (existingUser) {
            throw new errors_1.ConflictError('Email already exists', 'EMAIL_ALREADY_EXISTS');
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
            throw new errors_1.UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
        }
        // Verify password
        const isValid = await (0, password_util_1.verifyPassword)(input.password, user.passwordHash);
        if (!isValid) {
            throw new errors_1.UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
        }
        // Check if active
        if (!user.isActive) {
            throw new errors_1.UnauthorizedError('Account is inactive', 'ACCOUNT_INACTIVE');
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
}
exports.AuthService = AuthService;
