import { Request, Response, NextFunction } from 'express';
import { CourseService } from './course.service';
import { successResponse } from '../../common/utils/response.util';

export class CourseController {
  private courseService: CourseService;

  constructor() {
    this.courseService = new CourseService();
  }

  createCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.courseService.createCourse(
        req.body,
        req.user!.id,
        req.user!.role as any
      );
      res.status(201).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };

  getCourseList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.courseService.getCourseList(
        req.query as any,
        req.user?.id,
       req.user!.role as any
      );
      res.status(200).json(successResponse(result.courses, { pagination: result.pagination }));
    } catch (error) {
      next(error);
    }
  };

  getCourseBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.courseService.getCourseBySlug(
        req.params.slug as string,
        req.user?.id
      );
      res.status(200).json(successResponse({ course: result }));
    } catch (error) {
      next(error);
    }
  };

  publishCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.courseService.publishCourse(
        req.params.courseId as string,
        req.user!.id,
        req.user!.role as any
      );
      res.status(200).json(successResponse({ course: result }));
    } catch (error) {
      next(error);
    }
  };
}