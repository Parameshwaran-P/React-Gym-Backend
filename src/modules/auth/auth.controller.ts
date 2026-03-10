import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { successResponse } from '../../common/utils/response.util';
import { forgotPasswordSchema, resetPasswordSchema } from './auth.validation';
import { NotificationService } from '../../modules/notifications/services/notification.service';
import { NotificationType } from '@prisma/client';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.register(req.body);
      const notificationService = new NotificationService();
    console.log("result", result);
   await notificationService.sendNotification({
  userId: result.user.id,
  type: NotificationType.CUSTOM,
  title: 'Welcome to Gamified Learning!',
  message: 'Thank you for registering. We are excited to have you on board!',
  channels: ['EMAIL'],
  metadata: {
    testData: 'This is a test',
  },
});
    console.log('   ✅ Notification queued successfully');
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

async forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const result = await this.authService.forgotPassword(email);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);

    const result = await this.authService.resetPassword(
      token,
      newPassword
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
}
