import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { successResponse } from '@/common/utils/response.util';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  sendNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.notificationService.sendNotification(req.body);

      res.status(202).json(
        successResponse({
          message: 'Notification queued successfully',
        })
      );
    } catch (error) {
      next(error);
    }
  };

  sendBulkNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.notificationService.sendBulkNotifications(req.body);

      res.status(202).json(
        successResponse({
          message: 'Bulk notifications queued successfully',
          count: req.body.userIds.length,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getUserNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.userId as string;
      const { page = 1, limit = 20, unreadOnly = false } = req.query as any;

      const result = await this.notificationService.getUserNotifications(
        userId,
        page,
        limit,
        unreadOnly
      );

      res.json(
        successResponse(result, {
          pagination: {
            page,
            limit,
            total: result.total,
            totalPages: Math.ceil(result.total / limit),
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.notificationService.markAsRead(req.params.id as string);

      res.json(
        successResponse({
          message: 'Notification marked as read',
        })
      );
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      await this.notificationService.markAllAsRead(userId);

      res.json(
        successResponse({
          message: 'All notifications marked as read',
        })
      );
    } catch (error) {
      next(error);
    }
  };

  updatePreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      await this.notificationService.updatePreferences(userId, req.body);

      res.json(
        successResponse({
          message: 'Preferences updated successfully',
        })
      );
    } catch (error) {
      next(error);
    }
  };

  registerDeviceToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { token, platform } = req.body;

      await this.notificationService.registerDeviceToken(userId, token, platform);

      res.json(
        successResponse({
          message: 'Device token registered successfully',
        })
      );
    } catch (error) {
      next(error);
    }
  };

  unregisterDeviceToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;
      await this.notificationService.unregisterDeviceToken(token);

      res.json(
        successResponse({
          message: 'Device token unregistered successfully',
        })
      );
    } catch (error) {
      next(error);
    }
  };
}