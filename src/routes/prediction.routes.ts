import { Router } from "express";
import { asyncWrapper } from "../middleware/asyncWrapper";
import { createScan, deletePredictionById, getPredictionById, getUserScans } from "../controllers/prediction.controller";
import { uploadMemory } from "../middleware/upload";
import { verifyToken } from "../middleware/verifyToken";


const router = Router();

router.post("/create-scan", verifyToken, uploadMemory.single("image") , asyncWrapper(createScan));

router.get("/history", verifyToken, asyncWrapper(getUserScans));

router.get("/:predictionId", verifyToken, asyncWrapper(getPredictionById));

router.delete("/:predictionId", verifyToken, asyncWrapper(deletePredictionById));

export default router;
