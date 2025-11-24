import { Router } from 'express';
import { signup, signupValidation, login, loginValidation } from '../controllers/authController';
import { asyncWrapper } from '../middleware/asyncWrapper';

const router = Router();

router.post('/signup', signupValidation, asyncWrapper(signup));
router.post('/login', loginValidation, asyncWrapper(login));

export default router;