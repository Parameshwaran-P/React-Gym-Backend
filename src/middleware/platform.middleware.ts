import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      platform?: string;
    }
  }
}

export function platformMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const platform = (req.headers['x-platform'] as string) || 'web';
  req.platform = platform;
  next();
}