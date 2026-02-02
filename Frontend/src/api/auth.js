// src/api/auth.js
const API_URL = "http://localhost:3000/api/auth";
const PROTECTED_API = "http://localhost:3000/api/auth";

export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error en el servidor");
  return data;
};

export const logout = async () => {
  await fetch(`${API_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });
};

export const getProfile = async () => {
  const res = await fetch(`${PROTECTED_API}/me`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("No autenticado");
  if (!res.ok) throw new Error("No autenticado");
  return res.json();
};

export const updateProfile = async (data) => {
  const res = await fetch(`${PROTECTED_API}/me`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Error al actualizar perfil");
  }
  
  return res.json();
};

export const forgotPassword = async (email) => {
  const res = await fetch(`${API_URL}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al enviar el correo");
  return data;
};

export const register = async (userData) => {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al registrarse");
  return data;
};

export const requestOTP = async (email) => {
  const res = await fetch(`${API_URL}/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al enviar código");
  return data;
};

export const resetPassword = async (token, password) => {
  const res = await fetch(`${API_URL}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al restablecer la contraseña");
  return data;
};
