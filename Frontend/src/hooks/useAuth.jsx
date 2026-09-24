// src/hooks/useAuth.js
import { createContext, useContext, useState, useEffect } from "react";
import {
  login as loginApi,
  logout as logoutApi,
  getProfile,
} from "../api/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar sesión al montar
  useEffect(() => {
    (async () => {
      try {
        const data = await getProfile();
        setUser(data?.user || null);
      } catch (err) {
        // Un 401 en la carga inicial es el comportamiento normal cuando no hay sesión iniciada
        if (import.meta.env.DEV && err.statusCode && err.statusCode !== 401) {
          console.warn("[Auth] No active session or profile check failed:", err.message);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const data = await loginApi(email, password);
      if (!data?.publisher) {
        return { success: false, message: "No se pudieron obtener los datos de la cuenta." };
      }
      setUser(data.publisher);
      return { success: true };
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn("[Auth Login Failed]:", err);
      }
      const message = err.message || "No se pudo iniciar sesión. Verifica tus credenciales.";
      setError(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      setUser(null);
    }
  };

  const checkAuth = async () => {
    try {
      const data = await getProfile();
      setUser(data?.user || null);
    } catch (err) {
      if (import.meta.env.DEV && err.statusCode !== 401) {
        console.warn("[Auth checkAuth Failed]:", err.message);
      }
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
