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

  useEffect(() => {
    getProfile()
      .then((data) => setUser(data.publisher))
      .catch(() => setUser(null));
  }, []);

const login = async (email, password) => {
  try {
    const data = await loginApi(email, password);
    setUser(data.publisher);
    return true; // ✅ Retorna true si el login fue exitoso
  } catch (err) {
    return false; // ❌ Retorna false si hubo error
  }
};


  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
