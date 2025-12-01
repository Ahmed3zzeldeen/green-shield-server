import { Router } from 'express';
import { signup, signupValidation, login, loginValidation, refreshToken, logout } from '../controllers/authController';
import { asyncWrapper } from '../middleware/asyncWrapper';
import { verifyRefToken } from '../middleware/verifyToken';

const router = Router();

router.post('/signup', signupValidation, asyncWrapper(signup));
router.post('/login', loginValidation, asyncWrapper(login));
router.get('/refresh-token', verifyRefToken, asyncWrapper(refreshToken));

export default router;