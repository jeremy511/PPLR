// src/api/auth.js
const API_URL = "http://localhost:3000/api/auth";
const PROTECTED_API = "http://localhost:3000/api/protected";

export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // NECESARIO para cookies
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Error en login");
  return res.json();
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
  return res.json();
};
