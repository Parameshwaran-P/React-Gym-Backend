import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { successResponse } from '../../common/utils/response.util';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };
}
