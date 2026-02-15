import { Router } from "express";
import { getAnalyticsSummary } from "../controllers/analytics.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/analytics/summary", requireAuth, getAnalyticsSummary);

export default router;
