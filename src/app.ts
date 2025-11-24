// src/app.ts
import express from "express";
import cors from "cors";
import path from "path";
import corsOptions from "./config/corsOptions";
import { errorHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/authRoutes";
import imageRoutes from "./routes/imageRoutes";

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


app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("Welcome to the Green Shield Project API");
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});



export default app;