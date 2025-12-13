import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth(); // si existe, si no, ignora

  useEffect(() => {
    // opcional: disparar un chequeo de sesión
    if (checkAuth) {
      checkAuth().finally(() => {
        navigate("/dashboard", { replace: true });
      });
    } else {
      navigate("/dashboard", { replace: true });
    }
  }, []);

  return <p className="text-center mt-10">Cargando...</p>;
};

export default GoogleCallback;
