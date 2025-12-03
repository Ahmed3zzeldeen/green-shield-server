import { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import AppError from './errorHandler';
import { verifyAccessToken, verifyRefreshToken } from '../utils/jwt';

export const verifyToken = (req: Request & { currentUser?: JwtPayload }, res: Response, next: NextFunction) => {
    const authHeader: string | string[] | null = req.headers['Authorization'] || req.headers['authorization'] || null;
    if(!authHeader) {
        const error = AppError.create('Token is required', 401 )
        return next(error);
    }

    const token = authHeader.toString().split(' ')[1];
    try {
        const currentUser = verifyAccessToken(token);
        req.currentUser = currentUser;
        next();
    } catch (err) {
        const error = AppError.create('Invalid token', 401)
        return next(error);
    }   
}

export const verifyRefToken = (req: Request & { currentUser?: JwtPayload, refreshToken?: string }, res: Response, next: NextFunction) => {
    const authHeader: string | string[] | null = req.headers['Authorization'] || req.headers['authorization'] || null;
    if(!authHeader) {
        const error = AppError.create('Token is required', 401)
        return next(error);
    }

    const token = authHeader.toString().split(' ')[1];
    try {
        const currentUser = verifyRefreshToken(token);
        req.currentUser = currentUser;
        req.refreshToken = token;
        next();
    } catch (err) {
        const error = AppError.create('Invalid token', 401)
        return next(error);
    }   
}
