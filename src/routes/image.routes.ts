import { Router } from "express";
import upload from "../middleware/upload";
import { uploadImage, getImageById } from "../controllers/image.controller";
import { asyncWrapper } from "../middleware/asyncWrapper";

const router = Router();

router.post("/upload", upload.single("image"), asyncWrapper(uploadImage));

router.get("/:id", asyncWrapper(getImageById));

export default router;