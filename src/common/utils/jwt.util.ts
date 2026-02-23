import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(userId: string, email: string, role: string): string {
  return jwt.sign(
    { userId, email, role },
    env.JWT_SECRET as string,
    { expiresIn: parseInt(env.JWT_EXPIRES_IN) }
  );
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}