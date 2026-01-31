import { Router } from "express";
import { generatePlan } from "../controllers/plan.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/plan", requireAuth, generatePlan);

export default router;
