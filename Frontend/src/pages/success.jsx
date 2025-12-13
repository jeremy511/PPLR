import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function GoogleSuccess() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  useEffect(() => {
    (async () => {
      await checkAuth();
      navigate("/dashboard");
    })();
  }, []);

  return <h1>Verificando sesión...</h1>;
}
