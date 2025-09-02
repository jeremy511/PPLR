// src/controllers/authController.js
import * as AuthService from "../services/serviceAuth.js";

export const loginController = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await AuthService.login(email, password);
    if (!result.publisher) {
      return res.status(401).json({ error: "Usuario no enconwtrado" });
    }
    const { password: _, ...userWithoutPassword } = result.publisher;

    res.json({ token: result.token, publisher: userWithoutPassword });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};
