import jwt from 'jsonwebtoken';

export const generateJWT = (user: { id: string; email: string; role: string }) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '1d' }  // Adjust as needed
  );
};