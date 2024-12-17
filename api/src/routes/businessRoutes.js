import express from "express";
import {
  updateBusinessInfo,
  changePlan,
  getBusinessInfo,
  createPlan,
  getAllPlans,
  updatePlan,
  deletePlan,
  countAnalytics,
} from "../controllers/businessController.js";
import { authenticateToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Business routes
router.get("/", authenticateToken, getBusinessInfo);
router.put("/", authenticateToken, updateBusinessInfo);
router.post("/change-plan", authenticateToken, changePlan);

// Plan routes
router.post("/plans", authenticateToken, isAdmin, createPlan);
router.get("/plans", authenticateToken, getAllPlans);
router.put("/plans/:id", authenticateToken, isAdmin, updatePlan);
router.delete("/plans/:id", authenticateToken, isAdmin, deletePlan);

// Analytics routes
router.get("/analytics", authenticateToken, isAdmin, countAnalytics);

export default router;
