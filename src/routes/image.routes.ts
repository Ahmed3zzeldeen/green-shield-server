import { Router } from "express";
import upload from "../middleware/upload";
import {
  uploadImage,
  getImageById,
  getImageHistory,
} from "../controllers/image.controller";
import { asyncWrapper } from "../middleware/asyncWrapper";
import { verifyToken } from "../middleware/verifyToken";

const router = Router();

router.post(
  "/upload",
  verifyToken,
  upload.single("image"),
  asyncWrapper(uploadImage)
);

router.get("/history", verifyToken, asyncWrapper(getImageHistory));

router.get("/:id", asyncWrapper(getImageById));

export default router;
