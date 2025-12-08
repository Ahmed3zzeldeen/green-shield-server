import { Router } from 'express';
import { asyncWrapper } from '../middleware/asyncWrapper';
import { createScan } from '../controllers/prediction.controller';
import { uploadMemory } from '../middleware/upload';
import { verifyToken } from '../middleware/verifyToken';

const router = Router();

router.post('/create-scan', verifyToken , uploadMemory.single('image') , asyncWrapper(createScan));


export default router;