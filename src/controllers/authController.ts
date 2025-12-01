import { NextFunction, Request, Response } from 'express';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { sendResponse } from '../utils/response';
import { Role } from '../generated/prisma';
import AppError from '../middleware/errorHandler';

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
  body('role').isIn(['FARMER', 'GOVERNMENT', 'ADMIN']).optional(),

  // Conditional validation
  body('farmName').custom((value, { req }) => {
    if (req.body.role === 'FARMER' && !value) throw new Error('Farm name is required for farmers');
    return true;
  }),
  body('farmAddress').custom((value, { req }) => {
    if (req.body.role === 'FARMER' && !value) throw new Error('Farm address is required for farmers');
    return true;
  }),
  body('state').custom((value, { req }) => {
    if (req.body.role === 'GOVERNMENT' && !value) throw new Error('State is required for government users');
    return true;
  }),
  body('city').custom((value, { req }) => {
    if (req.body.role === 'GOVERNMENT' && !value) throw new Error('City is required for government users');
    return true;
  }),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const signup = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 400, { message: 'Validation failed', errors: errors.array() });
  }

  const {
    firstName, lastName, email, username, password, role = 'FARMER',
    farmName, farmAddress, state, city
  } = req.body;

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) return sendResponse(res, 400, { message: 'Email already exists' });

  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) return sendResponse(res, 400, { message: 'Username already exists' });

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
      }
    }
  });
};

export const login = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendResponse(res, 400, { errors: errors.array() });

  const { email, password } = req.body;
  // is user exists
  const userExists = await prisma.user.findUnique({ where: { email } });
  if (!userExists) return sendResponse(res, 400, { message: 'Invalid credentials' });
  
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, password: true, role: true, firstName: true, lastName: true, username: true, avatar: true }
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
        avatar: user.avatar || '/profile.png'
      }
    }
  });
};

export const refreshToken = async (req: Request & { refreshToken?: string }, res: Response, next: NextFunction) => {
  const refreshToken = req.refreshToken;

  jwt.verify(
    refreshToken!,
    process.env.JWT_REFRESH_SECRET!,
    async (err: VerifyErrors | null, decoded: any) => {
      if (err) {
        const error = AppError.create(
          "Invalid refresh token",
          401,
        );
        return next(error);
      }
      const foundUser = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!foundUser) {
        const error = AppError.create(
          "User not found",
          404
        );
        return next(error);
      }

      const accessToken = generateAccessToken({
          email: foundUser.email,
          username: foundUser.username,
          id: foundUser.id,
          role: foundUser.role,
          expiryTime: "7d",
      });

      const refreshToken = generateRefreshToken({
        username: foundUser.username,
        id: foundUser.id,
        expiryTime: "7d",
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
        message: "Token refreshed successfully",
      });
    });
};

// TODO: Implement the following controllers properly
export const logout = async (req: Request, res: Response) => { /* blacklist refresh token */ };
export const forgotPassword = async (req: Request, res: Response) => { /* send email */ };
export const resetPassword = async (req: Request, res: Response) => { /* verify token */ };
export const changePassword = async (req: Request, res: Response) => { /* protected */ };