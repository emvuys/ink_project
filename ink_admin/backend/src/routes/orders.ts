import { Router } from 'express';
import orderController from '../controllers/orderController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.put('/:id/status', orderController.updateOrderStatus);

export default router;
