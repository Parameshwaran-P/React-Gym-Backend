import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ForbiddenError } from '../common/errors/AppError';

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role as Role | undefined;

    if (!userRole || !allowedRoles.includes(userRole)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
}