import { AuthRepository } from './auth.repository';
import { hashPassword, verifyPassword } from '../../common/utils/password.util';
import { generateToken } from '../../common/utils/jwt.util';
import { ConflictError, UnauthorizedError } from '../../common/errors/AppError';
import { RegisterInput, LoginInput } from './auth.validation';

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
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
}