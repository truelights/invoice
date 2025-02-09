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

router.get("/", authenticateToken, isAdmin, getBusinessInfo);
router.put("/:_id", authenticateToken, isAdmin, updateBusinessInfo);
router.put("/change-plan/:business", authenticateToken, isAdmin, changePlan);

router.post("/plans", authenticateToken, isAdmin, createPlan);
router.get("/plans", authenticateToken, getAllPlans);
router.put("/plans/:id", authenticateToken, isAdmin, updatePlan);
router.delete("/plans/:id", authenticateToken, isAdmin, deletePlan);

router.get("/analytics", authenticateToken, isAdmin, countAnalytics);

export default router;
