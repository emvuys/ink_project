import { Router } from 'express';
import authController from '../controllers/authController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/login', authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);

export default router;
