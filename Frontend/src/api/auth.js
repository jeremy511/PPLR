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

  if (!res.ok) return false;
  const data = await res.json();
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
  return res.json();
};
