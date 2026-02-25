import { AuthRepository } from './auth.repository';
import { hashPassword, verifyPassword } from '../../common/utils/password.util';
import { generateToken } from '../../common/utils/jwt.util';
import { ConflictError, UnauthorizedError } from '../../common/errors/AppError';
import { RegisterInput, LoginInput } from './auth.validation';
import {  generateResetToken, hashResetToken } from '../../utils/reset-token';
import { NotificationService } from '../../common/services/notification.service';

export class AuthService {
  private authRepository: AuthRepository;
  private notificationService: NotificationService;

  constructor() {
    this.authRepository = new AuthRepository();
    this.notificationService = new NotificationService();
  }

  async register(input: RegisterInput) {
    // Check if user exists
    const existingUser = await this.authRepository.findUserByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('Email already exists', 'EMAIL_ALREADY_EXISTS');
    }

    // Hash password
    const passwordHash = await hashPassword(input.password);

    // Create user
    const user = await this.authRepository.createUser({
      email: input.email,
      passwordHash,
      displayName: input.displayName,
    });

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

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

  async login(input: LoginInput) {
    // Find user
    const user = await this.authRepository.findUserByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Verify password
    const isValid = await verifyPassword(input.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Check if active
    if (!user.isActive) {
      throw new UnauthorizedError('Account is inactive', 'ACCOUNT_INACTIVE');
    }

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

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

  async forgotPassword(email: string) {
  const user = await this.authRepository.findUserByEmail(email);

  const genericResponse = {
    message: 'If the email exists, a reset link has been sent.',
  };

  if (!user || !user.isActive) {
    return genericResponse;
  }

  const rawToken = generateResetToken();
  const tokenHash = hashResetToken(rawToken);
  const expiry = new Date(Date.now() + 15 * 60 * 1000);

  await this.authRepository.updateUser(user.id, {
    resetTokenHash: tokenHash,
    resetTokenExpiresAt: expiry,
  });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

  await this.notificationService.sendPasswordResetEmail(
    user.email,
    resetLink
  );

  return genericResponse;
}
async resetPassword(token: string, newPassword: string) {
  const tokenHash = hashResetToken(token);

  const user = await this.authRepository.findByResetTokenHash(tokenHash);

  if (!user) {
    throw new UnauthorizedError('Invalid or expired reset token');
  }

  if (!user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
    throw new UnauthorizedError('Reset token expired');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('Account inactive');
  }

  const passwordHash = await hashPassword(newPassword);

  await this.authRepository.updateUser(user.id, {
    passwordHash,
    resetTokenHash: null,
    resetTokenExpiresAt: null,
    passwordChangedAt: new Date(),
  });

  return { message: 'Password reset successful' };
}
}