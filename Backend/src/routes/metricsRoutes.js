import { Router } from "express";
import { getDashboardMetrics } from "../controllers/metricsController.js";
import { verifyToken, isAdmin } from "../Middleware/authMiddleware.js";

const router = Router();

// Only Admins can view reports
router.get("/dashboard", verifyToken, isAdmin, getDashboardMetrics);

export default router;
