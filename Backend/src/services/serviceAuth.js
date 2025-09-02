// src/services/authService.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as AuthRepo from "../Repositories/authRepository.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const login = async (email, password) => {
  const publisher = await AuthRepo.findPublisherByEmail(email);
  if (!publisher) throw new Error("Usuario no encontrado");

  const isMatch = await bcrypt.compare(password, publisher.password);
  if (!isMatch) throw new Error("Contraseña incorrecta");

  const token = jwt.sign(
    { id: publisher.id, role: publisher.role, email: publisher.email },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  return { token, publisher };
};
