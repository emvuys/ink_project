import { Router } from 'express';
import statsController from '../controllers/statsController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/dashboard', statsController.getDashboardStats);

export default router;
