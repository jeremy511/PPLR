// src/controllers/authController.js
import * as AuthService from "../services/serviceAuth.js";

export const loginController = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await AuthService.login(email, password);
    if (!result.publisher) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const { password: _, ...publisherWithoutPassword } = result.publisher;

    // Guardar el token en una cookie segura
    res.cookie("token", result.token, {
      httpOnly: true, // evita acceso desde JS
      secure: process.env.NODE_ENV === "production", // solo HTTPS en prod
      sameSite: "lax", // previene CSRF
      maxAge: 60 * 60 * 1000, // 1 hora
    });

    // Mandar JSON con info del usuario y opcionalmente el token
    res.json({
      publisher: publisherWithoutPassword,
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

export const registerController = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const result = await AuthService.register({ email, password, name });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
