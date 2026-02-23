import { Request, Response, NextFunction } from 'express';
import { AppError } from '../common/errors/AppError';
import { errorResponse } from '../common/utils/response.util';
import logger from '../config/logger';

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    logger.warn('Application error', {
      code: err.code,
      message: err.message,
      path: req.path,
      method: req.method,
    });

    return res.status(err.statusCode).json(
      errorResponse(err.code, err.message, err.details)
    );
  }

  // Unexpected errors
  logger.error('Unexpected error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json(
    errorResponse('INTERNAL_SERVER_ERROR', 'An unexpected error occurred')
  );
}