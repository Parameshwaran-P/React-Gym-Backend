import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../common/utils/jwt.util';
import { UnauthorizedError } from '../common/errors/AppError';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role as any,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Token expired', 'TOKEN_EXPIRED'));
    } else if (error.name === 'JsonWebTokenError') {
      next(new UnauthorizedError('Invalid token', 'INVALID_TOKEN'));
    } else {
      next(error);
    }
  }
}