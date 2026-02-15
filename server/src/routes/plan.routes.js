import { Router } from "express";
import {
  generatePlan,
  getPlanVersionById,
  listPlanHistory,
} from "../controllers/plan.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/plan", requireAuth, generatePlan);
router.get("/plans/history", requireAuth, listPlanHistory);
router.get("/plans/:id", requireAuth, getPlanVersionById);

export default router;
