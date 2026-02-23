import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import courseRoutes from '../modules/courses/course.routes';
import progressRoutes from '../modules/progress/progress.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/progress', progressRoutes);

export default router;