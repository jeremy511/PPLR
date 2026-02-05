import {z} from "zod"

export const registerSchema = z.object({
    firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
    email: z.string().email("Correo invalido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    phone: z.string().optional(),
    otpCode: z.string().length(6, "El código debe tener 6 dígitos")
})

export const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});