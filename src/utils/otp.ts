import crypto from "crypto";

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 100000–999999
};

export const hashOTP = (otp: string): string => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

export const isOTPExpired = (expiresAt: Date | null): boolean => {
  if (!expiresAt) return true;
  return new Date() > expiresAt;
};