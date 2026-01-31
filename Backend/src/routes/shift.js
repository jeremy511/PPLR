import express from "express";
import { getAllShifts, joinShift, leaveShift, createShift, adminAddPublisher, adminRemovePublisher, updateShiftStatus } from "../controllers/shiftController.js";
import { authMiddleware, adminMiddleware } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllShifts);
router.post("/:id/join", authMiddleware, joinShift);
router.post("/:id/leave", authMiddleware, leaveShift);
router.post("/", authMiddleware, createShift);

// Admin routes
router.post("/:id/admin/add", authMiddleware, adminMiddleware, adminAddPublisher);
router.post("/:id/admin/remove", authMiddleware, adminMiddleware, adminRemovePublisher);
router.patch("/:id/status", authMiddleware, adminMiddleware, updateShiftStatus);

export default router;