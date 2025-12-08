import { Router } from "express";
import {
  addFarm,
  getMyFarms,
  updateFarm,
  deleteFarm,
} from "../controllers/farm.controller";
import { asyncWrapper } from "../middleware/asyncWrapper";
import { verifyToken } from "../middleware/verifyToken";

const router = Router();

// Authenticated farmer adds farm (role check inside controller)
router.post("/", verifyToken, asyncWrapper(addFarm));

// Authenticated user gets their farms
router.get("/my", verifyToken, asyncWrapper(getMyFarms));

// Authenticated farmer updates farm (role check inside controller)
router.put("/:id", verifyToken, asyncWrapper(updateFarm));

// Authenticated farmer deletes farm (role check inside controller)
router.delete("/:id", verifyToken, asyncWrapper(deleteFarm));

export default router;
