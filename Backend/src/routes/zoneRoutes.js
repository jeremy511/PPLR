import express from "express";
import { getAllZones } from "../controllers/zoneController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getAllZones);

export default router;
