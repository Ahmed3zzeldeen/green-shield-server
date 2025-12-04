import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { sendResponse } from "../utils/response";
import AppError from "../middleware/errorHandler";
import { Role } from "@prisma/client";

// POST /api/farms
export const addFarm = async (
  req: Request & { currentUser?: { id: string; role?: Role } },
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.currentUser?.role !== Role.FARMER) {
      return sendResponse(res, 403, { message: "Only farmers can add farms" });
    }

    const { name, address, state, city, longitude, latitude } = req.body;

    const farm = await prisma.farm.create({
      data: {
        name,
        address,
        state,
        city,
        longitude,
        latitude,
        userId: req.currentUser.id,
      },
    });

    return sendResponse(res, 201, {
      message: "Farm created successfully",
      data: farm,
    });
  } catch (error) {
    return next(AppError.create("Failed to create farm", 500));
  }
};

// GET /api/farms/my
export const getMyFarms = async (
  req: Request & { currentUser?: { id: string; role?: Role } },
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.currentUser?.role !== Role.FARMER) {
      return sendResponse(res, 403, {
        message: "Only farmers can view their farms",
      });
    }

    const farms = await prisma.farm.findMany({
      where: { userId: req.currentUser.id },
    });

    return sendResponse(res, 200, {
      message: "Farms retrieved successfully",
      data: farms,
    });
  } catch (error) {
    return next(AppError.create("Failed to fetch farms", 500));
  }
};

// PUT /api/farms/:id
export const updateFarm = async (
  req: Request & { currentUser?: { id: string; role?: Role } },
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.currentUser?.role !== Role.FARMER) {
      return sendResponse(res, 403, {
        message: "Only farmers can update farms",
      });
    }

    const { id } = req.params;
    const { name, address, state, city, longitude, latitude } = req.body;

    const farm = await prisma.farm.findUnique({ where: { id } });
    if (!farm || farm.userId !== req.currentUser.id) {
      return sendResponse(res, 403, {
        message: "Not authorized to update this farm",
      });
    }

    const updatedFarm = await prisma.farm.update({
      where: { id },
      data: { name, address, state, city, longitude, latitude },
    });

    return sendResponse(res, 200, {
      message: "Farm updated successfully",
      data: updatedFarm,
    });
  } catch (error) {
    return next(AppError.create("Failed to update farm", 500));
  }
};

// DELETE /api/farms/:id
export const deleteFarm = async (
  req: Request & { currentUser?: { id: string; role?: Role } },
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.currentUser?.role !== Role.FARMER) {
      return sendResponse(res, 403, {
        message: "Only farmers can delete farms",
      });
    }

    const { id } = req.params;

    const farm = await prisma.farm.findUnique({ where: { id } });
    if (!farm) {
      return sendResponse(res, 403, {
        message: "This farm doesn't exist",
      });
    }
    
    if (farm.userId !== req.currentUser.id) {
      return sendResponse(res, 403, {
        message: "Not authorized to delete this farm",
      });
    }

    await prisma.farm.delete({ where: { id } });

    return sendResponse(res, 200, {
      message: "Farm deleted successfully",
      data: null,
    });
  } catch (error) {
    return next(AppError.create("Failed to delete farm", 500));
  }
};
