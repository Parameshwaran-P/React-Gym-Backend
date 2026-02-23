import { Router } from 'express';
import { ProgressController } from './progress.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { completeStepSchema } from './progress.validation';

const router = Router();
const progressController = new ProgressController();

router.post('/step', authMiddleware, validate(completeStepSchema), progressController.completeStep);
router.get('/me', authMiddleware, progressController.getUserProgress);

export default router;