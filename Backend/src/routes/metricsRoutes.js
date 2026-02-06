import { Router } from "express";
import { getDashboardMetrics } from "../controllers/metricsController.js";
import { authMiddleware, adminMiddleware } from "../Middleware/authMiddleware.js";

const router = Router();

// Only Admins can view reports
router.get("/dashboard", authMiddleware, adminMiddleware, getDashboardMetrics);

export default router;
