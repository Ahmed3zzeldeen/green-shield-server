import { Router } from 'express';
import { asyncWrapper } from '../middleware/asyncWrapper';
import { createScan } from '../controllers/prediction.controller';
import { uploadMemory } from '../middleware/upload';

const router = Router();

router.post('/create-scan', uploadMemory.single('image') ,  asyncWrapper(createScan));


export default router;