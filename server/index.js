import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./src/routes/auth.routes.js";
import checkinRoutes from "./src/routes/checkin.routes.js";
import planRoutes from "./src/routes/plan.routes.js";
import profileRoutes from "./src/routes/profile.routes.js";
import analyticsRoutes from "./src/routes/analytics.routes.js";
import { authLimiter, planLimiter } from "./src/middleware/rateLimit.js";

dotenv.config();

function parseOrigins(value) {
  if (!value || typeof value !== "string") return [];
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function allowedOriginsFromEnv() {
  const configured = parseOrigins(process.env.CORS_ORIGINS);
  if (configured.length > 0) return configured;

  // Dev fallback keeps local setup simple while forcing explicit config in production.
  if (process.env.NODE_ENV !== "production") {
    return ["http://localhost:5173", "http://127.0.0.1:5173"];
  }

  return [];
}

const allowedOrigins = new Set(allowedOriginsFromEnv());

const app = express();
app.use(express.json());

app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      // Allow non-browser clients (e.g. curl, uptime checks) with no Origin header.
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(cookieParser());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/checkin", planLimiter);
app.use("/api/plan", planLimiter);
app.use("/api/analytics", planLimiter);
app.use("/api", checkinRoutes);
app.use("/api", profileRoutes);
app.use("/api", planRoutes);
app.use("/api", analyticsRoutes);

const PORT = process.env.PORT || 5174;
const { MONGODB_URI } = process.env;

async function start() {
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI in environment.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Backend on http://localhost:${PORT}`));
  } catch (err) {
    console.error("MongoDB connection failed", err);
    process.exit(1);
  }
}

start();
