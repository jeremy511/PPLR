// src/api/auth.js
import { apiClient } from "../lib/apiClient";

export const login = async (email, password) => {
  return apiClient.post("/auth/login", { email, password });
};

export const logout = async () => {
  return apiClient.post("/auth/logout");
};

export const getProfile = async () => {
  return apiClient.get("/auth/me");
};

export const updateProfile = async (data) => {
  return apiClient.put("/auth/me", data);
};

export const forgotPassword = async (email) => {
  return apiClient.post("/auth/forgot-password", { email });
};

export const register = async (userData) => {
  return apiClient.post("/auth/register", userData);
};

export const requestOTP = async (email) => {
  return apiClient.post("/auth/request-otp", { email });
};

export const resetPassword = async (token, password) => {
  return apiClient.post("/auth/reset-password", { token, password });
};
