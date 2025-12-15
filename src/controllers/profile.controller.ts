import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { sendResponse } from "../utils/response";
import AppError from "../middleware/errorHandler";
import { Role } from "@prisma/client";
import { getPresignedUrl, uploadToS3, deleteFromS3 } from "../lib/s3";
import { selectFields } from "express-validator/lib/field-selection";

// GET /api/profile
export const getProfile = async (
  req: Request & { currentUser?: { id: string; role?: Role } },
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.currentUser) {
      return sendResponse(res, 401, { message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.currentUser.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        role: true,
        avatar: true,
        farms: {
          select: {
            name: true,
            address: true,
          },
        },
      },
    });

    if (!user) {
      return sendResponse(res, 404, { message: "User not found" });
    }

    let avatarUrl: string | null = null;

    if (user.avatar) {
      avatarUrl = await getPresignedUrl(user.avatar, 3600 * 24);
    }

    return sendResponse(res, 200, {
      message: "Profile retrieved successfully",
      data: { ...user, avatar: avatarUrl },
    });
  } catch (error) {
    return next(AppError.create("Failed to fetch profile", 500));
  }
};

// PUT /api/profile
export const updateProfile = async (
  req: Request & { currentUser?: { id: string; role?: Role } },
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.currentUser) {
      return sendResponse(res, 401, { message: "Unauthorized" });
    }

    const { firstName, lastName } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.currentUser.id },
      data: { firstName, lastName },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        role: true,
        avatar: true,
        updatedAt: true,
      },
    });

    return sendResponse(res, 200, {
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return next(AppError.create("Failed to update profile", 500));
  }
};

export const uploadOrUpdateAvatar = async (
  req: Request & {
    currentUser?: { id: string };
    file?: Express.Multer.File;
  },
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.currentUser) {
      return sendResponse(res, 401, { message: "Unauthorized" });
    }

    if (!req.file) {
      return sendResponse(res, 400, {
        message: "No image file provided. Use field name 'image'.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.currentUser.id },
      select: { avatar: true },
    });

    if (!user) {
      return sendResponse(res, 404, { message: "User not found" });
    }

    if (user.avatar) {
      await deleteFromS3(user.avatar);
    }

    const { key } = await uploadToS3(req.file, "avatars");

    await prisma.user.update({
      where: { id: req.currentUser.id },
      data: { avatar: key },
    });

    const avatarUrl = await getPresignedUrl(key, 3600 * 24);

    return sendResponse(res, 200, {
      message: "Profile image updated successfully",
      data: { avatar: avatarUrl },
    });
  } catch (error) {
    return next(AppError.create("Failed to update profile image", 500));
  }
};

// DELETE /api/profile
export const deleteProfile = async (
  req: Request & { currentUser?: { id: string; role?: Role } },
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.currentUser) {
      return sendResponse(res, 401, { message: "Unauthorized" });
    }

    // Soft delete (set deletedAt)
    await prisma.user.update({
      where: { id: req.currentUser.id },
      data: { deletedAt: new Date() },
    });

    return sendResponse(res, 200, {
      message: "Profile deleted successfully",
      data: null,
    });
  } catch (error) {
    return next(AppError.create("Failed to delete profile", 500));
  }
};
