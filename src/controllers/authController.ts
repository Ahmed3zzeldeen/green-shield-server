import { body, validationResult, type ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { createUser, findUserByEmail } from '../services/authService';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateJWT } from '../utils/jwt';
import { sendResponse } from '../utils/response';

export const signupValidation: ValidationChain[] = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty(),
  body('role').isIn(['STUDENT', 'TEACHER', 'SUPERVISOR', 'ADMIN']).optional(),
];

export const loginValidation: ValidationChain[] = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
];

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 400, { errors: errors.array() });
  }

  const { email, password, name, role = 'FARMER' } = req.body;

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return sendResponse(res, 409, { message: 'User already exists' });
  }

  const hashedPassword = await hashPassword(password);

  const user = await createUser({ email, password: hashedPassword, name, role });

  const token = generateJWT({ id: user.id, email: user.email, role: user.role });

  return sendResponse(res, 201, {
    message: 'User created successfully',
    data: { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token },
  });
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 400, { errors: errors.array() });
  }

  const { email, password } = req.body;

  const user = await findUserByEmail(email);
  if (!user) {
    return sendResponse(res, 401, { message: 'Invalid credentials' });
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    return sendResponse(res, 401, { message: 'Invalid credentials' });
  }

  const token = generateJWT({ id: user.id, email: user.email, role: user.role });

  return sendResponse(res, 200, {
    message: 'Login successful',
    data: { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token },
  });
};