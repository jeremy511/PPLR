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
        setUser(data.publisher || null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const data = await loginApi(email, password); // loginApi ya retorna JSON
      console.log("DATA EN USEAUTH:", data);
      if (!data) return false;
      if (!data.publisher) return false;
      setUser(data.publisher);
      return true;
    } catch (err) {
      console.error("ERROR EN LOGIN USEAUTH:", err);
      setError("Credenciales inválidas o error de conexión");
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
