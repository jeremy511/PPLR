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
        console.log("PERFIL DESDE EL BACKEND:", data);
        setUser(data.user || null);
      } catch (err) {
        console.error("ERROR AL OBTENER PERFIL:", err);
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
      console.log("LOGIN DESDE EL BACKEND:", data);
      if (!data) return { success: false, message: "No data received" };
      if (!data.publisher) return { success: false, message: "No publisher data" };
      setUser(data.publisher);
      return { success: true };
    } catch (err) {
      console.error("ERROR EN LOGIN USEAUTH:", err);
      setError(err.message);
      return { success: false, message: err.message };
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
      console.log("CHECK AUTH DESDE EL BACKEND:", data);
      setUser(data.user || null);
    } catch (err) {
      console.error("ERROR EN CHECK AUTH:", err);
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
