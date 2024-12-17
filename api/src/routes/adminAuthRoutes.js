import express from "express";
import {
  createAdmin,
  loginAdmin,
  forgotPassword,
  resetPassword,
} from "../controllers/adminAuthController.js";
import { authenticateToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/create", createAdmin);
router.post("/login", loginAdmin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
