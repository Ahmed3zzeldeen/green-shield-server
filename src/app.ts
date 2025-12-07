import express from "express";
import cors from "cors";
import path from "path";
import corsOptions from "./config/corsOptions";
import { errorHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/auth.routes";
import imageRoutes from "./routes/image.routes";
import farmRoutes from "./routes/farm.routes";
import predictionRoutes from "./routes/prediction.routes";

const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Static: serve uploaded images
// TODO: Change in production environment to use a CDN or cloud storage
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/farms", farmRoutes);

// Error Handling Middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    errorHandler(err, req, res);
  },
);

app.get("/", (_req, res) => {
  res.send("Welcome to the Green Shield Project API");
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

export default app;

