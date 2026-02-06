import { Router } from 'express';
import merchantController from '../controllers/merchantController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', merchantController.getMerchants);
router.get('/:id', merchantController.getMerchantById);
router.post('/', merchantController.createMerchant);
router.put('/:id', merchantController.updateMerchant);
router.delete('/:id', merchantController.deleteMerchant);
router.put('/:id/threshold', merchantController.updateAlertThreshold);
router.get('/:id/usage', merchantController.getUsageHistory);
router.get('/:id/refills', merchantController.getRefillHistory);

export default router;
