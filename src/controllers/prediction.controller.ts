import { Request, Response, NextFunction } from "express";
import { aiService } from "../services/prediction.service";
import { PredictOutput } from "../ai/client";
import { uploadToS3 } from "../lib/s3";
import { prisma } from "../lib/prisma";
import AppError from '../middleware/errorHandler';

export const createScan = async (
  req: Request & { file?: Express.Multer.File , currentUser?: { id: string } },
  res: Response,
  next: NextFunction
) => {
  if (!req?.file) {
    return res.status(400).json({
      success: false,
      message: "No image file provided. Use field name 'image'.",
    });
  }
  const userId = req.currentUser?.id;

  const imageBlob = new Blob([new Uint8Array(req.file.buffer)], {
    type: req.file.mimetype || "image/jpeg",
  });

  const aiResponse: PredictOutput = await aiService.predict(imageBlob);

  const { url, key } = await uploadToS3(req.file, "scans");
  const uploadedImage = await prisma.uploadedImage.create({
    data: {
      userId,
      url,
      key,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    },
  });

  if (!aiResponse || !aiResponse.label) {
    const error = AppError.create("AI prediction failed but image uploaded successfully we will predict it later stay tuned", 500);
    return next(error);
  }

  const diseaseNameMap: Record<string, string> = {
    blight: "Blight",
    common_rust: "Common Rust",
    gray_leaf_spot: "Gray Leaf Spot",
    healthy: "Healthy",
  };

  const disease = await prisma.disease.findUnique({
    where: { nameEn: diseaseNameMap[aiResponse.label] },
  });

  if (!disease) {
    const error = AppError.create("Disease not found in DB", 500);
    return next(error);
  }

  // Create prediction record aka Scan History
  const prediction = await prisma.prediction.create({
    data: {
      imageId: uploadedImage.id,
      userId,
      diseaseId: disease.id,
      confidence: Math.max(
        aiResponse.probability_blight ?? 0,
        aiResponse.probability_common_rust ?? 0,
        aiResponse.probability_gray_leaf_spot ?? 0,
        aiResponse.probability_healthy ?? 0
      ),
      severity: disease.severityLevel,
      predictedAt: new Date(),
    },
    include: {
      disease: {
        include: { treatments: true },
      },
    },
  });

  return res.status(201).json({
    success: true,
    message: "Corn Leaf Scan created successfully",
    data: {
      image: {
        id: uploadedImage.id,
        url: uploadedImage.url,
      },
      prediction: {
        disease: {
          nameEn: disease.nameEn,
          nameAr: disease.nameAr,
          severity: disease.severityLevel,
        },
        confidence: prediction.confidence,
        details: prediction.disease.treatments,
      },
      otherProbabilities: {
        blight: aiResponse.probability_blight,
        common_rust: aiResponse.probability_common_rust,
        gray_leaf_spot: aiResponse.probability_gray_leaf_spot,
        healthy: aiResponse.probability_healthy,
      },
    },
  });
};
