import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { sendResponse } from "../utils/response";
import AppError from "../middleware/errorHandler";

/**
 * POST /api/images/upload
 * Upload a maize leaf image
 */
export const uploadImage = async (
  req: Request & { currentUser?: { id: string } },
  res: Response
) => {
  try {
    if (!req?.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided. Use field name 'image'.",
      });
    }

    const { filename, mimetype, size } = req?.file;

    // Generate public URL
    const protocol = req.protocol;
    const host = req.get("host");
    const imageUrl = `${protocol}://${host}/uploads/${filename}`;

    // Save to database
    const uploadedImage = await prisma.uploadedImage.create({
      data: {
        url: imageUrl,
        filename,
        mimeType: mimetype,
        size,
        key: new Date().getTime().toString() + "_" + filename,
        userId: req.currentUser?.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Leaf image uploaded successfully",
      data: {
        imageId: uploadedImage.id,
        url: uploadedImage.url,
        filename: uploadedImage.filename,
        size: uploadedImage.size,
        uploadedAt: uploadedImage.uploadedAt,
      },
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload image",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * GET /api/images/:id
 * Optional: Get image details by ID (useful for debugging)
 */
export const getImageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const image = await prisma.uploadedImage.findUnique({
      where: { id },
      select: {
        id: true,
        url: true,
        filename: true,
        size: true,
        uploadedAt: true,
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: image,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET /api/images/history
export const getImageHistory = async (
  req: Request & { currentUser?: { id: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.currentUser) {
      return sendResponse(res, 401, { message: "Unauthorized" });
    }

    const images = await prisma.uploadedImage.findMany({
      where: { userId: req.currentUser.id },
      orderBy: { uploadedAt: "desc" },
      select: {
        id: true,
        url: true,
        filename: true,
        mimeType: true,
        size: true,
        uploadedAt: true,
      },
    });

    return sendResponse(res, 200, {
      message: "Image history retrieved successfully",
      data: images,
    });
  } catch (error) {
    return next(AppError.create("Failed to fetch image history", 500));
  }
};
