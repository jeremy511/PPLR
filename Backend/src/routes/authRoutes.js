// src/routes/authRoutes.js
import passport from "passport";
import express from "express";
import jwt from "jsonwebtoken";
import { loginController } from "../controllers/authController.js";
import { registerController } from "../controllers/authController.js";
import { validateSchema } from "../Middleware/validateMiddleware.js";
import { registerSchema, loginSchema } from "../validations/authValidations.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

import { FRONTEND_URL, JWT_SECRET } from "../config.js";

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
      { id: req.user.id, email: req.user.email },
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
router.get("/me", authMiddleware, (req, res) => {
  res.json({
    message: "Ruta protegida",
    user: req.user,
  });
});

export default router;
