import { Router } from 'express';
import { CourseController } from './course.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validation.middleware';
import { createCourseSchema, getCourseListSchema } from './course.validation';
import { Role } from '@prisma/client';

const router = Router();
const courseController = new CourseController();

// Public routes
router.get('/', validate(getCourseListSchema), courseController.getCourseList);
router.get('/:slug', courseController.getCourseBySlug);

// Protected routes
router.post(
  '/',
  authMiddleware,
  requireRole(Role.ADMIN, Role.CONTENT_EDITOR),
  validate(createCourseSchema),
  courseController.createCourse
);

router.patch(
  '/:courseId/publish',
  authMiddleware,
  requireRole(Role.ADMIN, Role.CONTENT_EDITOR),
  courseController.publishCourse
);

export default router;