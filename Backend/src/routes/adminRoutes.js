import express from "express";
import { authMiddleware, adminMiddleware } from "../Middleware/authMiddleware.js";
import { getSettingsController, updateSettingsController } from "../controllers/adminController.js";

const router = express.Router();

// Todas las rutas de administración requieren autenticación y rol ADMIN
router.use(authMiddleware, adminMiddleware);

// Configuración Global del Sistema
router.get("/settings", getSettingsController);
router.put("/settings", updateSettingsController);

export default router;
