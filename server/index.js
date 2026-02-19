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
  const trimmed = value.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((origin) => normalizeOrigin(origin)).filter(Boolean);
      }
    } catch {
      // Fall back to delimiter parsing below.
    }
  }
  return value
    .split(/[,\n]/)
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);
}

function normalizeOrigin(value) {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim().replace(/^['"]|['"]$/g, "");
  if (!trimmed) return "";
  if (trimmed.includes("*")) return trimmed.replace(/\/+$/, "");
  try {
    return new URL(trimmed).origin;
  } catch {
    return trimmed.replace(/\/+$/, "");
  }
}

function wildcardToRegex(pattern) {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped.replace(/\\\*/g, ".*")}$`);
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

const configuredOrigins = allowedOriginsFromEnv();
const allowedOrigins = new Set(configuredOrigins.filter((origin) => !origin.includes("*")));
const allowedOriginRegexes = configuredOrigins
  .filter((origin) => origin.includes("*"))
  .map((pattern) => wildcardToRegex(pattern));

const app = express();
// Render terminates TLS at a proxy and forwards client IP headers.
app.set("trust proxy", 1);
app.use(express.json());

app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      // Allow non-browser clients (e.g. curl, uptime checks) with no Origin header.
      if (!origin) return callback(null, true);
      const normalizedOrigin = normalizeOrigin(origin);
      if (allowedOrigins.has(normalizedOrigin)) return callback(null, true);
      if (allowedOriginRegexes.some((regex) => regex.test(normalizedOrigin))) return callback(null, true);
      console.warn(
        `[CORS] Blocked origin="${normalizedOrigin}" allowed=${JSON.stringify(configuredOrigins)}`
      );
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
    console.log(`[CORS] Allowed origins: ${JSON.stringify(configuredOrigins)}`);
    app.listen(PORT, () => console.log(`Backend on http://localhost:${PORT}`));
  } catch (err) {
    console.error("MongoDB connection failed", err);
    process.exit(1);
  }
}

start();
