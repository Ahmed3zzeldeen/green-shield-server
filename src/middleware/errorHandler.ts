import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  const status = err.status || 500;
  sendResponse(res, status, { message: err.message || 'Internal Server Error' });
};