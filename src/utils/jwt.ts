import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !REFRESH_SECRET) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be defined in environment variables');
}

export const generateAccessToken = (payload: { id: string; role: string , email?: string , username?: string  , expiryTime?: jwt.SignOptions['expiresIn'] }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: payload.expiryTime || '15m' });
};

export const generateRefreshToken = (payload: { id: string, username?: string, expiryTime?: jwt.SignOptions['expiresIn'] }) => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: payload.expiryTime || '7d' });
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_SECRET) as jwt.JwtPayload;
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
};