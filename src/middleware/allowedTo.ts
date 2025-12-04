import { Request, Response, NextFunction } from 'express';
import AppError from "./errorHandler";
import { Role, User } from '@prisma/client';

const allowedTo = (...roles: Role[]) => {
  return (req: Request & { currentUser: User }, res: Response, next: NextFunction) => {
    if (!roles.includes(req.currentUser.role)) {
      return next(AppError.create('This role is not authorized', 401))
    }
    next();
  };
}

export default allowedTo;