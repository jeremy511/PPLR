// src/controllers/authController.js
import * as AuthService from "../services/serviceAuth.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError, ValidationError, UnauthorizedError } from "../utils/errors.js";

export const loginController = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const result = await AuthService.login(email, password);
  if (!result.publisher) {
    throw new UnauthorizedError("Usuario no encontrado");
  }

  const { password: _, ...publisherWithoutPassword } = result.publisher;

  // Guardar el token en una cookie segura
  res.cookie("token", result.token, {
    httpOnly: true, // evita acceso desde JS
    secure: true, // Siempre HTTPS (Railway + Vercel)
    sameSite: "lax", // Correcto para Proxy (First-Party)
    maxAge: 7 * 24 * 60 * 60 * 1000, 
    path: "/", 
  });

  // Mandar JSON con info del usuario
  res.json({
    publisher: publisherWithoutPassword,
  });
});

export const registerController = catchAsync(async (req, res) => {
  const { email, password, firstName, lastName, phone, birthdate, gender, otpCode } = req.body;
  const result = await AuthService.register({ email, password, firstName, lastName, phone, birthdate, gender, otpCode });
  res.status(201).json(result);
});

export const logoutController = catchAsync(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
  res.json({ message: "Sesión cerrada exitosamente" });
});

export const getAllPublishers = catchAsync(async (req, res) => {
  const publishers = await AuthService.getAllPublishers();
  res.json(publishers);
});

export const deletePublisherController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const idInt = parseInt(id);
  if (isNaN(idInt)) {
    throw new ValidationError("ID inválido");
  }
  await AuthService.deletePublisher(idInt);
  res.json({ message: "Usuario eliminado correctamente" });
});

export const updatePublisherRoleController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const idInt = parseInt(id);
  if (isNaN(idInt)) {
    throw new ValidationError("ID de usuario inválido");
  }
  const { role } = req.body;
  const updatedUser = await AuthService.updatePublisherRole(idInt, role);
  res.json(updatedUser);
});

export const updatePublisherController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const idInt = parseInt(id);
  if (isNaN(idInt)) {
    throw new ValidationError("ID de usuario inválido");
  }
  const data = req.body;
  
  const updatedUser = await AuthService.updatePublisher(idInt, data);
  const { password: _, ...userWithoutPassword } = updatedUser;
  res.json(userWithoutPassword);
});

export const forgotPasswordController = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await AuthService.requestPasswordReset(email);
  res.json(result);
});

export const resetPasswordController = catchAsync(async (req, res) => {
  const { token, newPassword } = req.body;
  const result = await AuthService.resetPasswordWithToken(token, newPassword);
  res.status(200).json(result);
});

export const requestOTPController = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await AuthService.requestOTP(email);
  res.status(200).json(result);
});

export const updateProfileController = catchAsync(async (req, res) => {
  const { id } = req.user; // Obtener ID del usuario autenticado
  const { firstName, lastName, phone, birthdate, gender } = req.body;

  // Solo permitimos actualizar campos seguros, ignorando role, email, password, etc. por esta vía
  // Reutilizamos updatePublisher pero con un objeto filtrado
  const updatedUser = await AuthService.updatePublisher(id, {
    firstName,
    lastName,
    phone,
    birthdate,
    gender
  });

  const { password: _, ...userWithoutPassword } = updatedUser;
  res.json(userWithoutPassword);
});
