import { Request, Response, NextFunction } from 'express';
import { ProgressService } from '../progress/utils/progress.service';
import { successResponse } from '../../common/utils/response.util';

export class ProgressController {
  private progressService: ProgressService;

  constructor() {
    this.progressService = new ProgressService();
  }

  completeStep = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.progressService.completeStep(req.body, req.user!.id);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };

  getUserProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.progressService.getUserProgress(req.user!.id);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };
}