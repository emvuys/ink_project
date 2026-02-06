import { Router } from 'express';
import videoController from '../controllers/videoController';
import { authenticate } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

router.use(authenticate);

router.get('/', videoController.getVideos);
router.get('/:id', videoController.getVideoById);
router.post('/', upload.single('video'), videoController.createVideo);
router.put('/:id', upload.single('video'), videoController.updateVideo);
router.delete('/:id', videoController.deleteVideo);

export default router;
