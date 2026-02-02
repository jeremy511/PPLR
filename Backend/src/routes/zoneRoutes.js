import express from "express";
import { getAllZones, createZone, updateZone, deleteZone } from "../controllers/zoneController.js";
import { authMiddleware, adminMiddleware } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getAllZones);
router.post("/", authMiddleware, adminMiddleware, createZone);
router.put("/:id", authMiddleware, adminMiddleware, updateZone);
router.delete("/:id", authMiddleware, adminMiddleware, deleteZone);

export default router;
