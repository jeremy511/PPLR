import {ParseStatus, z} from "zod"

export const registerSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Correo invalido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
})

export const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});