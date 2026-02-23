import prisma from '../../config/prisma';
import { User, Role } from '@prisma/client';

export class AuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email, deletedAt: null },
    });
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    displayName?: string;
    role?: Role;
  }): Promise<User> {
    return prisma.user.create({
      data,
    });
  }
}