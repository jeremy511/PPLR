// src/controllers/authController.js
import * as AuthService from "../services/serviceAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { UnauthorizedError, ValidationError, AppError } from "../utils/errors.js";

export const loginController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await AuthService.login(email, password);
    if (!result.publisher) {
      throw new UnauthorizedError("Usuario no encontrado");
    }

    const { password: _, ...publisherWithoutPassword } = result.publisher;

    // Guardar el token en una cookie segura
    res.cookie("token", result.token, {
      httpOnly: true, // evita acceso desde JS
      secure: true, // NECESARIO para SameSite=None
      sameSite: "none", // Permite cross-site cookies (Vercel -> Railway)
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      path: "/", 
    });

    // Mandar JSON con info del usuario
    res.json({
      publisher: publisherWithoutPassword,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new UnauthorizedError(err.message);
  }
});

export const registerController = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, phone, birthdate, gender, otpCode } = req.body;
  try {
    const result = await AuthService.register({ email, password, firstName, lastName, phone, birthdate, gender, otpCode });
    res.status(201).json(result);
  } catch (err) {
    throw new ValidationError(err.message);
  }
});

export const logoutController = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  res.json({ message: "Sesión cerrada exitosamente" });
});

export const getAllPublishers = asyncHandler(async (req, res) => {
  const publishers = await AuthService.getAllPublishers();
  res.json(publishers);
});

export const deletePublisherController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const idInt = parseInt(id);
  if (isNaN(idInt)) {
    throw new ValidationError("ID inválido");
  }
  await AuthService.deletePublisher(idInt);
  res.json({ message: "Usuario eliminado correctamente" });
});

export const updatePublisherRoleController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    const updatedUser = await AuthService.updatePublisherRole(id, role);
    res.json(updatedUser);
  } catch (err) {
    throw new ValidationError(err.message);
  }
});

export const updatePublisherController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  
  try {
    const updatedUser = await AuthService.updatePublisher(id, data);
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (err) {
    throw new ValidationError("Error al actualizar usuario: " + err.message);
  }
});

export const forgotPasswordController = asyncHandler(async (req, res) => {
  const { email } = req.body;
  try {
    const result = await AuthService.requestPasswordReset(email);
    res.json(result);
  } catch (err) {
    throw new ValidationError(err.message);
  }
});

export const resetPasswordController = asyncHandler(async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const result = await AuthService.resetPasswordWithToken(token, newPassword);
        res.status(200).json(result);
    } catch (error) {
        throw new ValidationError(error.message);
    }
});

export const requestOTPController = asyncHandler(async (req, res) => {
    try {
        const { email } = req.body;
        const result = await AuthService.requestOTP(email);
        res.status(200).json(result);
    } catch (error) {
        throw new ValidationError(error.message);
    }
});

export const updateProfileController = asyncHandler(async (req, res) => {
  const { id } = req.user; // Obtener ID del usuario autenticado
  const { firstName, lastName, phone, birthdate, gender } = req.body;

  try {
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
  } catch (err) {
    throw new ValidationError("Error al actualizar perfil");
  }
});
