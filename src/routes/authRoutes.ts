import { Router } from 'express';
import { signup, signupValidation, login, loginValidation, refreshToken, logout, resetPassword, forgotPassword, changePassword, forgotPasswordValidation, resetPasswordValidation, changePasswordValidation, sendVerificationEmail, confirmEmail, resendVerificationEmail, sendVerificationEmailValidation, confirmEmailValidation } from '../controllers/authController';
import { asyncWrapper } from '../middleware/asyncWrapper';
import { verifyRefToken, verifyToken } from '../middleware/verifyToken';

const router = Router();

router.post('/signup', signupValidation, asyncWrapper(signup));
router.post('/login', loginValidation, asyncWrapper(login));
router.post('/logout', verifyRefToken, asyncWrapper(logout));
router.post('/forgot-password' ,forgotPasswordValidation, asyncWrapper(forgotPassword));
router.post('/reset-password', resetPasswordValidation , asyncWrapper(resetPassword));
router.post('/change-password', changePasswordValidation , verifyToken , asyncWrapper(changePassword));
router.post('/send-verification-email',sendVerificationEmailValidation, asyncWrapper(sendVerificationEmail));
router.post('/resend-verification',sendVerificationEmailValidation, asyncWrapper(resendVerificationEmail));
router.post('/confirm-email', confirmEmailValidation, asyncWrapper(confirmEmail));
router.get('/refresh-token', verifyRefToken, asyncWrapper(refreshToken));

export default router;