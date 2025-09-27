// src/routes/authRoutes.js
import express from "express";
import { loginController } from "../controllers/authController.js";
import { registerController } from "../controllers/authController.js";
import { validateSchema } from "../Middleware/validateMiddleware.js";
import { registerSchema, loginSchema } from "../validations/authValidations.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", validateSchema(loginSchema), loginController);
router.post("/register", validateSchema(registerSchema), registerController);
router.get("/me", authMiddleware, (req, res) => {
  res.json({
    message: "Ruta protegida",
    user: req.user,
  });
});

export default router;
