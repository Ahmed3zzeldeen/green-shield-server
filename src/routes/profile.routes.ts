import { Router } from "express";
import {
  getProfile,
  updateProfile,
  uploadOrUpdateAvatar,
  // deleteProfile,
} from "../controllers/profile.controller";
import { asyncWrapper } from "../middleware/asyncWrapper";
import { verifyToken } from "../middleware/verifyToken";
import { uploadMemory } from "../middleware/upload";

const router = Router();

//* Get current user's profile
router.get("/", verifyToken, asyncWrapper(getProfile));

//* Update current user's profile
router.put("/", verifyToken, asyncWrapper(updateProfile));

router.put(
  "/profile-picture",
  verifyToken,
  uploadMemory.single("image"),
  asyncWrapper(uploadOrUpdateAvatar)
);

//* Delete current user's profile (soft delete)
// router.delete("/", verifyToken, asyncWrapper(deleteProfile));

export default router;
