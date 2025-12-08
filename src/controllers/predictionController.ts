import { Request, Response, NextFunction } from "express";
import { aiService } from "../services/prediction.service";
import { PredictOutput } from "../ai/client";

export const createScan = async (
  req: Request & { file?: Express.Multer.File },
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req?.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided. Use field name 'image'.",
      });
    }
    // This is the correct, type-safe way
    const imageBlob = new Blob([new Uint8Array(req.file.buffer)], {
      type: req.file.mimetype || "image/jpeg",
    });

    const aiResponse: PredictOutput = await aiService.predict(imageBlob);

    // TODO: Save scan result to database

    if (!aiResponse || !aiResponse.label) {
      return res.status(500).json({
        success: false,
        message: "AI prediction failed",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Leaf image uploaded successfully",
      data: {
        prediction: aiResponse.label,
        probabilities: {
          blight: aiResponse.probability_blight,
          common_rust: aiResponse.probability_common_rust,
          gray_leaf_spot: aiResponse.probability_gray_leaf_spot,
          healthy: aiResponse.probability_healthy,
        },
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
