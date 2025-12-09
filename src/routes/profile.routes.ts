import { Router } from "express";
import {
  getProfile,
  updateProfile,
  deleteProfile,
} from "../controllers/profile.controller";
import { asyncWrapper } from "../middleware/asyncWrapper";
import { verifyToken } from "../middleware/verifyToken";

const router = Router();

//* Get current user's profile
router.get("/", verifyToken, asyncWrapper(getProfile));

//* Update current user's profile
router.put("/", verifyToken, asyncWrapper(updateProfile));

//* Delete current user's profile (soft delete)
// router.delete("/", verifyToken, asyncWrapper(deleteProfile));


export default router;
