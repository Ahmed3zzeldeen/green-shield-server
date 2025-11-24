import { Response } from 'express';

export const sendResponse = (res: Response, statusCode: number, payload: any) => {
  return res.status(statusCode).json({
    success: statusCode < 400,
    ...payload,
  });
};