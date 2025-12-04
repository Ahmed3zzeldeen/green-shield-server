import { Request, Response, NextFunction } from 'express';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { sendResponse } from '../utils/response';
import { Role } from '@prisma/client';
import AppError from '../middleware/errorHandler';
import Email from '../utils/email';
import { generateOTP, hashOTP } from '../utils/otp';

// Password regex: 6+ chars, 1 uppercase, 1 lowercase, 1 digit, 1 special
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

export const signupValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password')
    .matches(passwordRegex)
    .withMessage('Password must be 6+ chars and contain uppercase, lowercase, digit, and special char'),
  body('role').isIn(Object.values(Role)).optional(),

  // Conditional validation
  body('farmName').custom((value, { req }) => {
    if (req.body.role === Role.FARMER && !value)
      throw new Error('Farm name is required for farmers');
    return true;
  }),
  body('farmAddress').custom((value, { req }) => {
    if (req.body.role === Role.FARMER && !value)
      throw new Error('Farm address is required for farmers');
    return true;
  }),
  body('state').custom((value, { req }) => {
    if (req.body.role === Role.GOVERNMENT && !value)
      throw new Error('State is required for government users');
    return true;
  }),
  body('city').custom((value, { req }) => {
    if (req.body.role === Role.GOVERNMENT && !value)
      throw new Error('City is required for government users');
    return true;
  }),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
];

export const resetPasswordValidation = [
  body('resetPasswordOtp')
    .isLength({ min: 6, max: 6 })
    .withMessage('Valid 6-digit code is required'),
  body('password').matches(passwordRegex)
    .withMessage(
      'New password must be 6+ chars and contain uppercase, lowercase, digit, and special char'
    ),
];

export const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').matches(passwordRegex)
    .withMessage(
      'New password must be 6+ chars and contain uppercase, lowercase, digit, and special char'
    ),
];

export const sendVerificationEmailValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
];

export const confirmEmailValidation = [
  body('emailVerificationOtp')
    .isLength({ min: 6, max: 6 })
    .withMessage('Verification code must be 6 digits'),
];


export const signup = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 400, {
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const {
    firstName,
    lastName,
    email,
    username,
    password,
    role = 'FARMER',
    farmName,
    farmAddress,
    state,
    city,
  } = req.body;

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail)
    return sendResponse(res, 400, { message: 'Email already exists' });

  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });
  if (existingUsername)
    return sendResponse(res, 400, { message: 'Username already exists' });

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
      role: role as Role,
      farmName: role === 'FARMER' ? farmName : null,
      farmAddress: role === 'FARMER' ? farmAddress : null,
      state: role === 'GOVERNMENT' ? state : null,
      city: role === 'GOVERNMENT' ? city : null,
    },
  });

  try {
    const otp = generateOTP();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationOtp: hashOTP(otp),
        emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await new Email(
      { email: user.email, firstName: user.firstName },
      otp
    ).sendEmailVerification();
  } catch (error) {
    // we skipped failure because email verification is (non-critical)
    console.log('Failed to send verification email (non-critical):', error);
  }

  const accessToken = generateAccessToken({ id: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });

  return sendResponse(res, 201, {
    message: 'User registered successfully',
    data: {
      token: { access: accessToken, refresh: refreshToken },
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
      },
    },
  });
};

export const login = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return sendResponse(res, 400, { errors: errors.array() });

  const { email, password } = req.body;
  // is user exists
  const userExists = await prisma.user.findUnique({ where: { email } });
  if (!userExists)
    return sendResponse(res, 400, { message: 'Invalid credentials' });

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      password: true,
      role: true,
      firstName: true,
      lastName: true,
      username: true,
      avatar: true,
    },
  });

  if (!user || !(await comparePassword(password, user.password))) {
    return sendResponse(res, 400, { message: 'Invalid credentials' });
  }

  const accessToken = generateAccessToken({ id: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });

  return sendResponse(res, 200, {
    data: {
      token: { access: accessToken, refresh: refreshToken },
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email,
        username: user.username,
        role: user.role,
        avatar: user.avatar || '/profile.png',
      },
    },
  });
};

export const refreshToken = async (
  req: Request & { refreshToken?: string },
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.refreshToken;

  jwt.verify(
    refreshToken!,
    process.env.JWT_REFRESH_SECRET!,
    async (err: VerifyErrors | null, decoded: any) => {
      if (err) {
        const error = AppError.create('Invalid refresh token', 401);
        return next(error);
      }
      const foundUser = await prisma.user.findUnique({
        where: { id: decoded.id },
      });
      if (!foundUser) {
        const error = AppError.create('User not found', 404);
        return next(error);
      }

      const accessToken = generateAccessToken({
        email: foundUser.email,
        username: foundUser.username,
        id: foundUser.id,
        role: foundUser.role,
        expiryTime: '7d',
      });

      const refreshToken = generateRefreshToken({
        username: foundUser.username,
        id: foundUser.id,
        expiryTime: '7d',
      });
      const UserData = {
        id: foundUser.id,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        email: foundUser.email,
        username: foundUser.username,
        role: foundUser.role,
        avatar: foundUser.avatar,
      };
      res.json({
        data: {
          token: { refresh: refreshToken, access: accessToken },
          user: UserData,
        },
        status: 200,
        message: 'Token refreshed successfully',
      });
    }
  );
};

export const logout = async (req: Request, res: Response) => {
  const cookie = req.cookies;
  if (!cookie?.jwt) {
    return res.sendStatus(204); // No content
  }
  res.clearCookie('jwt', {
    httpOnly: true, // client-side js cannot access the cookie
    secure: process.env.NODE_ENV === 'production', // only send cookie over https
    sameSite: 'none', // only send cookie if the request is coming from the same origin
  });

  res.json({
    status: 200,
    message: 'Logged out successfully',
  });
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(AppError.create(errors.array().map(err => err.msg).join(', '), 400));
  }

  const { email } = req.body;
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, firstName: true, email: true },
  });

  if (!user) {
    return sendResponse(res, 200, {
      message: 'If your email exists, we sent a code.',
      data: null,
    });
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordOtp: hashOTP(otp),
      resetPasswordExpires: expiresAt,
    },
  });

  try {
    await new Email(user, otp).sendPasswordReset();
    return sendResponse(res, 200, {
      message: 'Password reset code sent to your email.',
      data: null,
    });
  } catch (error) {
    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordOtp: null, resetPasswordExpires: null },
    });
    return next(AppError.create('Failed to send email', 500));
  }
};


export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(AppError.create(errors.array().map(err => err.msg).join(', '), 400));
  }

  const { password, resetPasswordOtp } = req.body;

  const otp = hashOTP(resetPasswordOtp);

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordOtp: otp,
        resetPasswordExpires: {
          gt: new Date(), // Not expired
        },
      },
    });

    if (!user) {
      return next(AppError.create('Invalid or expired code', 400));
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordOtp: null,
        resetPasswordExpires: null,
      },
    });

    return sendResponse(res, 200, {
      message: 'Password has been reset successfully.',
      data: null,
    });
  } catch (error) {
    return next(AppError.create('Server error during password reset', 500));
  }
};


export const changePassword = async (
  req: Request & { currentUser?: { id: string } },
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(AppError.create(errors.array().map(err => err.msg).join(', '), 400));
  }

  const { currentPassword, newPassword } = req.body;
  const userId = req?.currentUser?.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      return next(AppError.create('User not found', 404));
    }

    const isCorrectPassword = await comparePassword(
      currentPassword,
      user.password
    );
    if (!isCorrectPassword) {
      return sendResponse(res, 400, {
        message: 'Incorrect current password',
      });
    }

    const hashedNewPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return sendResponse(res, 200, {
      message: 'Password changed successfully',
      data: null,
    });
  } catch (error) {
    return next(AppError.create('Failed to change password', 500));
  }
};

export const sendVerificationEmail = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(AppError.create(errors.array().map(err => err.msg).join(', '), 400));
  }
  const { email } = req.body;

  if (!email) {
    return next(AppError.create('Email is required', 400));
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, firstName: true, email: true, isEmailVerified: true },
  });

  if (!user) {
    return sendResponse(res, 200, {
      message: 'If your email is registered, a verification code has been sent.',
      data: null,
    });
  }

  if (user.isEmailVerified) {
    return sendResponse(res, 400, {
      message: 'Email is already verified',
      data: null,
    });
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationOtp: hashOTP(otp),
      emailVerificationExpires: expiresAt,
    },
  });

  try {
    await new Email(user, otp).sendEmailVerification();

    return sendResponse(res, 200, {
      message: 'Verification code sent to your email',
      data: null,
    });
  } catch (error) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationOtp: null,
        emailVerificationExpires: null,
      },
    });
    return next(AppError.create('Failed to send verification email', 500));
  }
};

export const resendVerificationEmail = async (req: Request, res: Response, next: NextFunction) => {
  return sendVerificationEmail(req, res, next);
};

export const confirmEmail = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(AppError.create(errors.array().map(err => err.msg).join(', '), 400));
  }

  const { emailVerificationOtp } = req.body;
  const hashedOtp = hashOTP(emailVerificationOtp);

  const user = await prisma.user.findFirst({
    where: {
      emailVerificationOtp: hashedOtp,
      emailVerificationExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    return next(AppError.create('Invalid or expired verification code', 400));
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerificationOtp: null,
      emailVerificationExpires: null,
    },
  });

  return sendResponse(res, 200, {
    message: 'Email verified successfully',
    data: null,
  });
};
