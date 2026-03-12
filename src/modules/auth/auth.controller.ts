import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { successResponse } from '../../common/utils/response.util';
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
  type: NotificationType.REGISTRATION_SUCCESS,
  title: 'Welcome to Gamified Learning!',
  message: 'Thank you for registering. We are excited to have you on board!',
  channels: ['EMAIL'],
  metadata: {
      name: result.user.displayName,
      loginUrl: 'https://react-gym-eight.vercel.app/',
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
        const notificationService = new NotificationService();

    await notificationService.sendNotification({
      userId: result.user.id,
      type: NotificationType.LOGIN_SUCCESS,
      title: 'New Login Detected',
      message: 'Your account was successfully logged in.',
      channels: ['EMAIL'],
      metadata: {
        name: result.user.displayName,
        device: req.headers['user-agent'],
        location: req.ip,
        time: new Date().toLocaleString(),
        securityUrl: 'https://react-gym-eight.vercel.app/security'
      },
    });
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };

forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const result = await this.authService.forgotPassword(email);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    
    const { token, newPassword } = req.body;

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
