// src/schemas/auth.js
import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .email("El email debe ser válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .email("El email debe ser válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(32, "La contraseña no puede tener más de 32 caracteres")
    .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula")
    .regex(/[a-z]/, "La contraseña debe contener al menos una letra minúscula")
    .regex(/[0-9]/, "La contraseña debe contener al menos un número")
    .regex(
      /[@$!%*?&]/,
      "La contraseña debe contener al menos un carácter especial (@$!%*?&)"
    ),
});
