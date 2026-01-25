// src/routes/authRoutes.js
import passport from "passport";
import express from "express";
import jwt from "jsonwebtoken";
import { loginController, registerController, logoutController } from "../controllers/authController.js";
import { validateSchema } from "../Middleware/validateMiddleware.js";
import { registerSchema, loginSchema } from "../validations/authValidations.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

import { FRONTEND_URL, JWT_SECRET } from "../config.js";
import prisma from "../lib/prisma.js";


const router = express.Router();
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
    session: false,
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5173/login",
  }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, name: req.user.name },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    res.redirect("http://localhost:5173/success");
  }
);

router.post("/login", validateSchema(loginSchema), loginController);
router.post("/register", validateSchema(registerSchema), registerController);
router.post("/logout", logoutController);
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.publisher.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({
      message: "Ruta protegida",
      user: user,
    });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener el perfil" });
  }
});

export default router;
