import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middleware/validation.middleware';
import { registerSchema, loginSchema } from './auth.validation';

const router = Router();
const authController = new AuthController();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

export default router;