import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./src/routes/auth.routes.js";
import planRoutes from "./src/routes/plan.routes.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api", planRoutes);

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
