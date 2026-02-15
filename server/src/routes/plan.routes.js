import { Router } from "express";
import { generatePlan, listPlanHistory } from "../controllers/plan.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/plan", requireAuth, generatePlan);
router.get("/plans/history", requireAuth, listPlanHistory);

export default router;
