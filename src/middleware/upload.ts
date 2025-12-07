import multer from "multer";
import path from "path";
import { Request } from "express";
import fs from "fs";

// Ensure uploads folder exists
const UPLOADS_DIR = path.join(__dirname, "../../uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Custom filename: timestamp + random + original extension
const generateFileName = (req: Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) => {
  const random = Math.floor(Math.random() * 10000);
  const timestamp = Date.now();
  const ext = path.extname(file.originalname).toLowerCase();
  const filename = `leaf_${timestamp}_${random}${ext}`;
  callback(null, filename);
};

// File filter: only allow images (jpeg, jpg, png, webp)
const fileFilter = (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif"
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error("Only image files are allowed! Supported: JPEG, PNG, WebP, HEIC"));
  }
};

// Multer config
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, UPLOADS_DIR);
    },
    filename: generateFileName,
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
  },
  fileFilter,
});

// In-memory storage for prediction routes
const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

export default upload;
export { uploadMemory };