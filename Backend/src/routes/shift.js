import express from "express";
import { getAllShifts, joinShift, leaveShift, createShift } from "../controllers/shiftController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllShifts);
router.post("/:id/join", authMiddleware, joinShift);
router.post("/:id/leave", authMiddleware, leaveShift);
router.post("/", authMiddleware, createShift);

export default router;