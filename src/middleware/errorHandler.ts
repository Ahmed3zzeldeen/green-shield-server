import { Request, Response } from "express";

class AppError extends Error {
  statusCode: number | undefined;
  status: boolean | undefined;

  create(message: string, statusCode: number, status?: boolean) {
    this.message = message;
    this.statusCode = statusCode;
    this.status = status || (statusCode < 300 ? true : false);
    return this;
  }
}

export const errorHandler = (error: AppError, req: Request, res: Response) => {
  const statusCode = error.statusCode || 500;
  const status = error.status || statusCode < 300 ? true : false;
  const message = error.message || "Internal Server Error";

  return res.status(statusCode || 500).json({
    status: status,
    message: message,
    code: statusCode || 500,
    data: null,
  });
};

export default new AppError() as AppError;
